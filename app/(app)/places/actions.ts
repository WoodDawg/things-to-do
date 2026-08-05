'use server';

import { eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '@/db';
import {
  placeCost,
  placeDuration,
  placeSetting,
  places,
  placeStatus,
  placeTags,
  placeType,
  tags,
} from '@/db/schema';
import { requireAuth } from '@/lib/auth';
import { STATE_CODES } from '@/lib/states';
import { normalizeTag } from '@/lib/tags';

export type PlaceFormState = { error: string | null };

type RequiredFields = {
  name: string;
  type: (typeof placeType.enumValues)[number];
  state: string;
};

function parseRequired(formData: FormData): { fields?: RequiredFields; error?: string } {
  const name = String(formData.get('name') ?? '').trim();
  const type = String(formData.get('type') ?? '');
  const state = String(formData.get('state') ?? '')
    .trim()
    .toUpperCase();

  if (!name) return { error: 'Name is missing — give the place a name and save again.' };
  if (!(placeType.enumValues as readonly string[]).includes(type)) {
    return { error: 'Pick a type before saving.' };
  }
  if (!STATE_CODES.has(state)) {
    return { error: 'Pick a state before saving.' };
  }

  return { fields: { name, type: type as RequiredFields['type'], state } };
}

function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  return typeof v === 'string' && v.trim() ? v.trim() : null;
}

function enumOrNull<T extends readonly string[]>(
  formData: FormData,
  key: string,
  values: T,
): T[number] | null {
  const v = formData.get(key);
  return typeof v === 'string' && (values as readonly string[]).includes(v)
    ? (v as T[number])
    : null;
}

function urlOrNull(formData: FormData, key: string): string | null {
  const v = str(formData, key);
  if (!v) return null;
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function coordOrNull(formData: FormData, key: string, max: number): number | null {
  const v = formData.get(key);
  if (typeof v !== 'string' || !v.trim()) return null;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) && Math.abs(n) <= max ? n : null;
}

function parseOptional(formData: FormData) {
  let latitude = coordOrNull(formData, 'latitude', 90);
  let longitude = coordOrNull(formData, 'longitude', 180);
  if (latitude == null || longitude == null) {
    latitude = null;
    longitude = null;
  }

  const tagNames = [
    ...new Set(
      (str(formData, 'tags') ?? '')
        .split(',')
        .map(normalizeTag)
        .filter(Boolean),
    ),
  ];

  return {
    values: {
      locality: str(formData, 'locality'),
      address: str(formData, 'address'),
      latitude,
      longitude,
      setting: enumOrNull(formData, 'setting', placeSetting.enumValues) ?? ('either' as const),
      duration: enumOrNull(formData, 'duration', placeDuration.enumValues),
      cost: enumOrNull(formData, 'cost', placeCost.enumValues),
      reservationRequired: formData.get('reservationRequired') === 'on',
      priority: formData.get('priority') === 'on',
      websiteUrl: urlOrNull(formData, 'websiteUrl'),
      sourceUrl: urlOrNull(formData, 'sourceUrl'),
      notes: str(formData, 'notes'),
    },
    tagNames,
  };
}

async function syncTags(placeId: string, tagNames: string[]): Promise<void> {
  const db = getDb();
  if (tagNames.length) {
    await db
      .insert(tags)
      .values(tagNames.map((name) => ({ name })))
      .onConflictDoNothing();
  }
  const rows = tagNames.length
    ? await db.select().from(tags).where(inArray(tags.name, tagNames))
    : [];
  await db.delete(placeTags).where(eq(placeTags.placeId, placeId));
  if (rows.length) {
    await db.insert(placeTags).values(rows.map((r) => ({ placeId, tagId: r.id })));
  }
}

export async function createPlace(
  _prev: PlaceFormState,
  formData: FormData,
): Promise<PlaceFormState> {
  await requireAuth();

  const { fields, error } = parseRequired(formData);
  if (!fields) return { error: error! };
  const { values, tagNames } = parseOptional(formData);

  let id: string;
  try {
    const inserted = await getDb()
      .insert(places)
      .values({
        ...fields,
        ...values,
        geocodedAt: values.latitude != null ? new Date() : null,
      })
      .returning({ id: places.id });
    id = inserted[0].id;
    await syncTags(id, tagNames);
  } catch {
    return { error: "Couldn't save — the database didn't respond. Try again in a few seconds." };
  }

  revalidatePath('/');
  redirect('/');
}

export async function updatePlace(
  id: string,
  _prev: PlaceFormState,
  formData: FormData,
): Promise<PlaceFormState> {
  await requireAuth();

  const { fields, error } = parseRequired(formData);
  if (!fields) return { error: error! };
  const { values, tagNames } = parseOptional(formData);

  try {
    const db = getDb();
    const [existing] = await db.select().from(places).where(eq(places.id, id)).limit(1);
    if (!existing) {
      return { error: 'This place no longer exists — it may have been deleted.' };
    }

    const coordsChanged =
      values.latitude !== existing.latitude || values.longitude !== existing.longitude;

    await db
      .update(places)
      .set({
        ...fields,
        ...values,
        geocodedAt:
          values.latitude == null ? null : coordsChanged ? new Date() : existing.geocodedAt,
        updatedAt: new Date(),
      })
      .where(eq(places.id, id));

    await syncTags(id, tagNames);
  } catch {
    return { error: "Couldn't save — the database didn't respond. Try again in a few seconds." };
  }

  revalidatePath('/');
  revalidatePath(`/places/${id}`);
  redirect(`/places/${id}`);
}

export async function markAsBeen(id: string): Promise<void> {
  await requireAuth();

  const today = new Date().toISOString().slice(0, 10);
  await getDb()
    .update(places)
    .set({ status: 'been', lastVisitedAt: today, updatedAt: new Date() })
    .where(eq(places.id, id));

  revalidatePath('/');
  revalidatePath(`/places/${id}`);
}

const RATEABLE = ['been', 'favorite'] as const;

export async function updateStatus(id: string, formData: FormData): Promise<void> {
  await requireAuth();

  const status = String(formData.get('status') ?? '');
  if (!(placeStatus.enumValues as readonly string[]).includes(status)) return;
  const s = status as (typeof placeStatus.enumValues)[number];

  const ratingRaw = Number.parseInt(String(formData.get('rating') ?? ''), 10);
  // Rating only exists for places actually visited (been/favorite).
  const rating =
    (RATEABLE as readonly string[]).includes(s) && ratingRaw >= 1 && ratingRaw <= 5
      ? ratingRaw
      : null;

  const visitedRaw = String(formData.get('lastVisitedAt') ?? '').trim();
  let lastVisitedAt = /^\d{4}-\d{2}-\d{2}$/.test(visitedRaw) ? visitedRaw : null;
  if (!lastVisitedAt && (RATEABLE as readonly string[]).includes(s)) {
    lastVisitedAt = new Date().toISOString().slice(0, 10);
  }

  await getDb()
    .update(places)
    .set({ status: s, rating, lastVisitedAt, updatedAt: new Date() })
    .where(eq(places.id, id));

  revalidatePath('/');
  revalidatePath(`/places/${id}`);
}

export async function deletePlace(id: string): Promise<void> {
  await requireAuth();

  await getDb().delete(places).where(eq(places.id, id));

  revalidatePath('/');
  redirect('/');
}
