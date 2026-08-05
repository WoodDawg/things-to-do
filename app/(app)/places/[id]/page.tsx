import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { Compass, ExternalLink, MapPin, Navigation } from 'lucide-react';
import { getDb } from '@/db';
import { places } from '@/db/schema';
import { DeleteButton } from '@/components/DeleteButton';
import { StatusBlaze } from '@/components/StatusBlaze';
import { TypeIcon } from '@/components/TypeIcon';
import {
  COST_LABELS,
  DURATION_LABELS,
  SETTING_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from '@/lib/labels';
import { appleMapsUrl, googleDirectionsUrl, googleMapsUrl } from '@/lib/map-links';
import { isUuid } from '@/lib/uuid';
import { deletePlace } from '@/app/(app)/places/actions';

const linkBtn =
  'flex min-h-11 items-center justify-center gap-2 rounded-lg border border-spruce px-3 text-sm font-bold text-spruce';

export default async function PlaceDetailPage({ params }: PageProps<'/places/[id]'>) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const [place] = await getDb().select().from(places).where(eq(places.id, id)).limit(1);
  if (!place) notFound();

  const directions = googleDirectionsUrl(place);

  return (
    <article className="flex flex-col gap-5">
      <header className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-card text-spruce">
          <TypeIcon type={place.type} className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-bold uppercase leading-tight tracking-wide">
            {place.name}
          </h1>
          <p className="text-mist">
            {TYPE_LABELS[place.type]} · {place.locality ? `${place.locality}, ` : ''}
            {place.state}
          </p>
        </div>
      </header>

      <p className="flex items-center gap-2 text-sm font-bold">
        <StatusBlaze status={place.status} />
        {STATUS_LABELS[place.status]}
        {place.priority ? <span className="ml-2 rounded bg-blaze px-1.5 py-0.5 text-xs uppercase text-white">Priority</span> : null}
      </p>

      <div className="grid grid-cols-2 gap-2">
        <a href={appleMapsUrl(place)} target="_blank" rel="noopener noreferrer" className={linkBtn}>
          <MapPin className="size-4" aria-hidden="true" /> Apple Maps
        </a>
        <a href={googleMapsUrl(place)} target="_blank" rel="noopener noreferrer" className={linkBtn}>
          <Compass className="size-4" aria-hidden="true" /> Google Maps
        </a>
        {directions ? (
          <a href={directions} target="_blank" rel="noopener noreferrer" className={linkBtn}>
            <Navigation className="size-4" aria-hidden="true" /> Directions
          </a>
        ) : null}
        {place.websiteUrl ? (
          <a href={place.websiteUrl} target="_blank" rel="noopener noreferrer" className={linkBtn}>
            <ExternalLink className="size-4" aria-hidden="true" /> Website
          </a>
        ) : null}
        {place.sourceUrl ? (
          <a href={place.sourceUrl} target="_blank" rel="noopener noreferrer" className={linkBtn}>
            <ExternalLink className="size-4" aria-hidden="true" /> Source
          </a>
        ) : null}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-gravel/15 bg-card p-4 text-sm">
        {place.address ? (
          <div className="col-span-2">
            <dt className="text-mist">Address</dt>
            <dd>{place.address}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-mist">Setting</dt>
          <dd>{SETTING_LABELS[place.setting]}</dd>
        </div>
        {place.duration ? (
          <div>
            <dt className="text-mist">Duration</dt>
            <dd>{DURATION_LABELS[place.duration]}</dd>
          </div>
        ) : null}
        {place.cost ? (
          <div>
            <dt className="text-mist">Cost</dt>
            <dd>{COST_LABELS[place.cost]}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-mist">Reservation</dt>
          <dd>{place.reservationRequired ? 'Required' : 'Not needed'}</dd>
        </div>
        {place.rating != null ? (
          <div>
            <dt className="text-mist">Rating</dt>
            <dd>{'★'.repeat(place.rating)}{'☆'.repeat(5 - place.rating)}</dd>
          </div>
        ) : null}
        {place.lastVisitedAt ? (
          <div>
            <dt className="text-mist">Last visited</dt>
            <dd>{place.lastVisitedAt}</dd>
          </div>
        ) : null}
      </dl>

      {place.notes ? (
        <section>
          <h2 className="mb-1 font-display text-lg font-semibold uppercase tracking-wide">Notes</h2>
          <p className="whitespace-pre-wrap rounded-xl border border-gravel/15 bg-card p-4 text-sm">
            {place.notes}
          </p>
        </section>
      ) : null}

      <div className="mt-2 flex flex-col gap-2">
        <Link
          href={`/places/${place.id}/edit`}
          className="flex h-11 items-center justify-center rounded-lg bg-spruce font-display text-lg font-semibold uppercase tracking-wide text-white"
        >
          Edit
        </Link>
        <DeleteButton action={deletePlace.bind(null, place.id)} />
      </div>
    </article>
  );
}
