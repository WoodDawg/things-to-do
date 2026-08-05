import { PlaceForm } from '@/components/PlaceForm';
import { createPlace } from '@/app/(app)/places/actions';

export default function NewPlacePage() {
  return (
    <>
      <h1 className="mb-4 font-display text-3xl font-bold uppercase tracking-wide">Add place</h1>
      <PlaceForm
        action={createPlace}
        submitLabel="Save place"
        defaultState={process.env.HOME_STATE ?? ''}
      />
    </>
  );
}
