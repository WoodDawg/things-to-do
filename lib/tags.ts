// Starter vocabulary (spec §3) — protected from orphan-pruning so autocomplete
// always has these on offer even when nothing uses them yet.
export const STARTER_TAGS = new Set([
  'hike', 'waterfall', 'scenic-drive', 'overlook', 'state-park', 'national-park',
  'zoo', 'aquarium', 'brewery', 'winery', 'farm', 'historic', 'dog-friendly',
  'kid-friendly', 'date-night', 'crowded', 'seasonal',
]);

// Shared by the TagInput (client) and place actions (server).
export function normalizeTag(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
