import { getDb } from '@/db';
import { tags } from '@/db/schema';
import { PlaceForm } from '@/components/PlaceForm';
import { createPlace } from '@/app/(app)/places/actions';

export default async function NewPlacePage() {
  const allTags = await getDb().select({ name: tags.name }).from(tags).orderBy(tags.name);

  return (
    <>
      <h1 className="mb-4 font-display text-3xl font-bold uppercase tracking-wide">Add place</h1>
      <PlaceForm
        action={createPlace}
        submitLabel="Save place"
        defaultState={process.env.HOME_STATE ?? ''}
        existingTags={allTags.map((t) => t.name)}
      />
    </>
  );
}
