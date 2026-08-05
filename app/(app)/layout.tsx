import Link from 'next/link';
import { FolderTree, List, Map as MapIcon, Plus } from 'lucide-react';
import { requireAuth } from '@/lib/auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <header className="sticky top-0 z-10 border-b border-gravel/10 bg-limestone/95 px-4 py-3 backdrop-blur">
        <Link
          href="/"
          className="font-display text-2xl font-bold uppercase tracking-wide text-spruce"
        >
          Things to do
        </Link>
      </header>

      <main className="flex-1 px-4 pt-4">{children}</main>

      <footer className="px-4 pb-28 pt-8 text-xs text-mist">
        Geocoding © OpenStreetMap contributors, ODbL
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-gravel/10 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-2 px-4 py-3">
          <Link
            href="/"
            className="flex h-12 flex-1 flex-col items-center justify-center rounded-lg text-xs font-bold text-gravel active:bg-limestone"
          >
            <List className="size-5" aria-hidden="true" />
            Places
          </Link>
          <Link
            href="/places/new"
            className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-lg bg-spruce font-display text-lg font-semibold uppercase tracking-wide text-white active:bg-spruce-deep"
          >
            <Plus className="size-5" aria-hidden="true" />
            Add place
          </Link>
          <Link
            href="/browse"
            className="flex h-12 flex-1 flex-col items-center justify-center rounded-lg text-xs font-bold text-gravel active:bg-limestone"
          >
            <FolderTree className="size-5" aria-hidden="true" />
            Browse
          </Link>
          <Link
            href="/map"
            className="flex h-12 flex-1 flex-col items-center justify-center rounded-lg text-xs font-bold text-gravel active:bg-limestone"
          >
            <MapIcon className="size-5" aria-hidden="true" />
            Map
          </Link>
        </div>
      </div>
    </div>
  );
}
