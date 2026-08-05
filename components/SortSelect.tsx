'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { SortKey } from '@/lib/filters';

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'dist', label: 'Closest first' },
  { value: 'new', label: 'Recently added' },
  { value: 'old', label: 'Oldest added' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'name', label: 'Name A–Z' },
];

export function SortSelect({ current, hasHome }: { current: SortKey; hasHome: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <label className="flex items-center gap-1 text-sm text-mist">
      <span className="sr-only">Sort</span>
      <select
        value={current}
        onChange={(e) => {
          const sp = new URLSearchParams(searchParams);
          if (e.target.value === 'dist') sp.delete('sort');
          else sp.set('sort', e.target.value);
          router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
        }}
        className="h-9 rounded-lg border border-gravel/25 bg-card px-2 text-sm text-gravel"
      >
        {OPTIONS.filter((o) => o.value !== 'dist' || hasHome).map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
