'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '@/db';
import { places, placeType } from '@/db/schema';
import { requireAuth } from '@/lib/auth';
import { STATE_CODES } from '@/lib/states';

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

export async function createPlace(
  _prev: PlaceFormState,
  formData: FormData,
): Promise<PlaceFormState> {
  await requireAuth();

  const { fields, error } = parseRequired(formData);
  if (!fields) return { error: error! };

  try {
    await getDb().insert(places).values(fields);
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

  try {
    const updated = await getDb()
      .update(places)
      .set({ ...fields, updatedAt: new Date() })
      .where(eq(places.id, id))
      .returning({ id: places.id });
    if (updated.length === 0) {
      return { error: "This place no longer exists — it may have been deleted." };
    }
  } catch {
    return { error: "Couldn't save — the database didn't respond. Try again in a few seconds." };
  }

  revalidatePath('/');
  revalidatePath(`/places/${id}`);
  redirect(`/places/${id}`);
}

export async function deletePlace(id: string): Promise<void> {
  await requireAuth();

  await getDb().delete(places).where(eq(places.id, id));

  revalidatePath('/');
  redirect('/');
}
