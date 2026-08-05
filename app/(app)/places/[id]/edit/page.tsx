import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { getDb } from '@/db';
import { places } from '@/db/schema';
import { PlaceForm } from '@/components/PlaceForm';
import { isUuid } from '@/lib/uuid';
import { updatePlace } from '@/app/(app)/places/actions';

export default async function EditPlacePage({ params }: PageProps<'/places/[id]/edit'>) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const [place] = await getDb().select().from(places).where(eq(places.id, id)).limit(1);
  if (!place) notFound();

  return (
    <>
      <h1 className="mb-4 font-display text-3xl font-bold uppercase tracking-wide">Edit place</h1>
      <PlaceForm
        action={updatePlace.bind(null, place.id)}
        submitLabel="Save changes"
        defaultState={process.env.HOME_STATE ?? ''}
        initial={{ name: place.name, type: place.type, state: place.state }}
      />
    </>
  );
}
