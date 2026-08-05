'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

const KEY = 'ttd:last-list';

/** Mounted on the list page: remembers the exact list view (tab + filters). */
export function RememberListView() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const q = searchParams.toString();
    try {
      sessionStorage.setItem(KEY, q ? `/?${q}` : '/');
    } catch {}
  }, [searchParams]);
  return null;
}

/** A link to the list that returns to the last-viewed tab and filters. */
export function ListLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Link
      href="/"
      className={className}
      onClick={(e) => {
        let stored: string | null = null;
        try {
          stored = sessionStorage.getItem(KEY);
        } catch {}
        if (stored && stored !== '/') {
          e.preventDefault();
          router.push(stored);
        }
      }}
    >
      {children}
    </Link>
  );
}

/** Back arrow: browser back when possible, otherwise the remembered list view. */
export function BackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          let stored: string | null = null;
          try {
            stored = sessionStorage.getItem(KEY);
          } catch {}
          router.push(stored ?? '/');
        }
      }}
      className="flex size-10 shrink-0 items-center justify-center rounded-lg text-gravel active:bg-card"
    >
      <ArrowLeft className="size-5" aria-hidden="true" />
    </button>
  );
}
