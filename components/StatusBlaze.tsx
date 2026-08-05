import type { PlaceStatusValue } from '@/db/schema';
import { STATUS_LABELS } from '@/lib/labels';

// The signature element (DESIGN.md): a painted trail blaze, color-coded by status.
const BLAZE_STYLES: Record<PlaceStatusValue, string> = {
  want_to_go: 'border-2 border-spruce bg-transparent',
  been: 'bg-spruce',
  favorite: 'bg-blaze',
  ruled_out: 'bg-mist/50 [background-image:linear-gradient(135deg,transparent_45%,white_45%,white_55%,transparent_55%)]',
};

export function StatusBlaze({ status }: { status: PlaceStatusValue }) {
  return (
    <span className="inline-flex items-center" title={STATUS_LABELS[status]}>
      <span className={`h-4 w-2.5 rounded-[2px] ${BLAZE_STYLES[status]}`} aria-hidden="true" />
      <span className="sr-only">{STATUS_LABELS[status]}</span>
    </span>
  );
}
