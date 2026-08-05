import {
  placeCost,
  placeDuration,
  placeSetting,
  placeStatus,
  placeType,
} from '@/db/schema';

export type SortKey = 'dist' | 'new' | 'old' | 'rating' | 'name';

export type Filters = {
  // preset chips
  close: boolean;
  rainy: boolean;
  free: boolean;
  quick: boolean;
  nores: boolean;
  priority: boolean;
  // panel — 'visited' = been OR favorite (the quick "Been" tab)
  status: (typeof placeStatus.enumValues)[number] | 'visited' | 'all';
  state: string | null;
  locality: string | null;
  types: (typeof placeType.enumValues)[number][];
  tags: string[];
  setting: (typeof placeSetting.enumValues)[number] | null;
  durations: (typeof placeDuration.enumValues)[number][];
  costs: (typeof placeCost.enumValues)[number][];
  res: 'yes' | 'no' | null;
  maxdist: number | null;
  q: string | null;
  sort: SortKey;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function all(v: string | string[] | undefined): string[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

function one(v: string | string[] | undefined): string | null {
  const a = all(v);
  return a.length ? a[a.length - 1] : null;
}

function inEnum<T extends readonly string[]>(values: T, v: string | null): T[number] | null {
  return v !== null && (values as readonly string[]).includes(v) ? (v as T[number]) : null;
}

function manyInEnum<T extends readonly string[]>(values: T, vs: string[]): T[number][] {
  return vs.filter((v): v is T[number] => (values as readonly string[]).includes(v));
}

export function parseFilters(sp: RawSearchParams): Filters {
  const statusRaw = one(sp.status);
  const sortRaw = one(sp.sort);
  const maxdistRaw = Number.parseInt(one(sp.maxdist) ?? '', 10);

  return {
    close: one(sp.close) === '1',
    rainy: one(sp.rainy) === '1',
    free: one(sp.free) === '1',
    quick: one(sp.quick) === '1',
    nores: one(sp.nores) === '1',
    priority: one(sp.priority) === '1',
    status:
      statusRaw === 'all' || statusRaw === 'visited'
        ? statusRaw
        : (inEnum(placeStatus.enumValues, statusRaw) ?? 'want_to_go'),
    state: one(sp.state)?.toUpperCase() || null,
    locality: one(sp.locality)?.trim() || null,
    types: manyInEnum(placeType.enumValues, all(sp.type)),
    tags: all(sp.tag).filter(Boolean),
    setting: inEnum(placeSetting.enumValues, one(sp.setting)),
    durations: manyInEnum(placeDuration.enumValues, all(sp.duration)),
    costs: manyInEnum(placeCost.enumValues, all(sp.cost)),
    res: one(sp.res) === 'yes' ? 'yes' : one(sp.res) === 'no' ? 'no' : null,
    maxdist: Number.isFinite(maxdistRaw) && maxdistRaw > 0 ? maxdistRaw : null,
    q: one(sp.q)?.trim() || null,
    sort: (['dist', 'new', 'old', 'rating', 'name'] as const).includes(sortRaw as SortKey)
      ? (sortRaw as SortKey)
      : 'dist',
  };
}

/** Serialize back to a query string (used to build chip-toggle and clear links). */
export function toSearchParams(f: Filters): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.close) sp.set('close', '1');
  if (f.rainy) sp.set('rainy', '1');
  if (f.free) sp.set('free', '1');
  if (f.quick) sp.set('quick', '1');
  if (f.nores) sp.set('nores', '1');
  if (f.priority) sp.set('priority', '1');
  if (f.status !== 'want_to_go') sp.set('status', f.status);
  if (f.state) sp.set('state', f.state);
  if (f.locality) sp.set('locality', f.locality);
  for (const t of f.types) sp.append('type', t);
  for (const t of f.tags) sp.append('tag', t);
  if (f.setting) sp.set('setting', f.setting);
  for (const d of f.durations) sp.append('duration', d);
  for (const c of f.costs) sp.append('cost', c);
  if (f.res) sp.set('res', f.res);
  if (f.maxdist != null) sp.set('maxdist', String(f.maxdist));
  if (f.q) sp.set('q', f.q);
  if (f.sort !== 'dist') sp.set('sort', f.sort);
  return sp;
}

export function countActivePanelFilters(f: Filters): number {
  let n = 0;
  // status is surfaced by the To go / Been / Everything tabs, not the panel badge
  if (f.state) n++;
  if (f.locality) n++;
  n += f.types.length ? 1 : 0;
  n += f.tags.length ? 1 : 0;
  if (f.setting) n++;
  n += f.durations.length ? 1 : 0;
  n += f.costs.length ? 1 : 0;
  if (f.res) n++;
  if (f.maxdist != null) n++;
  if (f.q) n++;
  return n;
}
