import Link from 'next/link';
import { FilterPanel } from '@/components/FilterPanel';
import {
  countActivePanelFilters,
  toSearchParams,
  type Filters,
} from '@/lib/filters';

const CHIPS: { key: 'close' | 'rainy' | 'free' | 'quick' | 'nores' | 'priority'; label: string }[] =
  [
    { key: 'close', label: 'Close by' },
    { key: 'rainy', label: 'Rainy day' },
    { key: 'free', label: 'Free' },
    { key: 'quick', label: 'Quick trip' },
    { key: 'nores', label: 'No booking' },
    { key: 'priority', label: 'Priority' },
  ];

const TABS: { value: Filters['status']; label: string }[] = [
  { value: 'want_to_go', label: 'To go' },
  { value: 'visited', label: 'Been' },
  { value: 'all', label: 'Everything' },
];

function href(basePath: string, sp: URLSearchParams): string {
  const s = sp.toString();
  return s ? `${basePath}?${s}` : basePath;
}

export function FilterBar({
  filters,
  allTags,
  hasHome,
  basePath,
}: {
  filters: Filters;
  allTags: string[];
  hasHome: boolean;
  basePath: string;
}) {
  const activeCount = countActivePanelFilters(filters);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-3 gap-1 rounded-xl border border-gravel/15 bg-card p-1">
        {TABS.map((t) => {
          const sp = toSearchParams(filters);
          if (t.value === 'want_to_go') sp.delete('status');
          else sp.set('status', t.value);
          const active = filters.status === t.value;
          return (
            <Link
              key={t.value}
              href={href(basePath, sp)}
              replace
              scroll={false}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-10 items-center justify-center rounded-lg font-display text-base font-semibold uppercase tracking-wide ${
                active ? 'bg-spruce text-white' : 'text-gravel active:bg-limestone'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <FilterPanel
          filters={filters}
          activeCount={activeCount}
          allTags={allTags}
          hasHome={hasHome}
          basePath={basePath}
        />
        {CHIPS.filter((c) => c.key !== 'close' || hasHome).map((c) => {
          const sp = toSearchParams(filters);
          if (sp.has(c.key)) sp.delete(c.key);
          else sp.set(c.key, '1');
          const on = Boolean(filters[c.key]);
          return (
            <Link
              key={c.key}
              href={href(basePath, sp)}
              replace
              scroll={false}
              className={`flex min-h-9 shrink-0 items-center rounded-full border px-3 text-sm font-bold ${
                on ? 'border-spruce bg-spruce text-white' : 'border-gravel/25 bg-card text-gravel'
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
