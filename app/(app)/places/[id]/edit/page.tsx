import { notFound } from 'next/navigation';
import { eq, isNotNull } from 'drizzle-orm';
import { getDb } from '@/db';
import { places, placeTags, tags } from '@/db/schema';
import { PlaceForm } from '@/components/PlaceForm';
import { isUuid } from '@/lib/uuid';
import { updatePlace } from '@/app/(app)/places/actions';

export default async function EditPlacePage({ params }: PageProps<'/places/[id]/edit'>) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const db = getDb();
  const [place] = await db.select().from(places).where(eq(places.id, id)).limit(1);
  if (!place) notFound();

  const [allTags, ownTags, localities] = await Promise.all([
    db.select({ name: tags.name }).from(tags).orderBy(tags.name),
    db
      .select({ name: tags.name })
      .from(placeTags)
      .innerJoin(tags, eq(placeTags.tagId, tags.id))
      .where(eq(placeTags.placeId, id)),
    db
      .selectDistinct({ locality: places.locality })
      .from(places)
      .where(isNotNull(places.locality))
      .orderBy(places.locality),
  ]);

  return (
    <>
      <h1 className="mb-4 font-display text-3xl font-bold uppercase tracking-wide">Edit place</h1>
      <PlaceForm
        action={updatePlace.bind(null, place.id)}
        submitLabel="Save changes"
        defaultState={process.env.HOME_STATE ?? ''}
        existingTags={allTags.map((t) => t.name)}
        localities={localities.map((l) => l.locality!).filter(Boolean)}
        initial={{ ...place, tags: ownTags.map((t) => t.name) }}
      />
    </>
  );
}
