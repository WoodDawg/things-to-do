import { isNotNull } from 'drizzle-orm';
import { getDb } from '@/db';
import { places, tags } from '@/db/schema';
import { PlaceForm } from '@/components/PlaceForm';
import { createPlace } from '@/app/(app)/places/actions';

export default async function NewPlacePage() {
  const db = getDb();
  const [allTags, names, localities] = await Promise.all([
    db.select({ name: tags.name }).from(tags).orderBy(tags.name),
    db.select({ name: places.name }).from(places),
    db
      .selectDistinct({ locality: places.locality })
      .from(places)
      .where(isNotNull(places.locality))
      .orderBy(places.locality),
  ]);

  return (
    <>
      <h1 className="mb-4 font-display text-3xl font-bold uppercase tracking-wide">Add place</h1>
      <PlaceForm
        action={createPlace}
        submitLabel="Save place"
        defaultState={process.env.HOME_STATE ?? ''}
        existingTags={allTags.map((t) => t.name)}
        existingNames={names.map((n) => n.name)}
        localities={localities.map((l) => l.locality!).filter(Boolean)}
      />
    </>
  );
}
