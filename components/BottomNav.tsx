'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FolderTree, List, Map as MapIcon, Plus } from 'lucide-react';
import { ListLink } from '@/components/ListMemory';

const side =
  'flex h-12 flex-1 flex-col items-center justify-center rounded-lg text-xs font-bold active:bg-limestone';

export function BottomNav() {
  const pathname = usePathname();
  const cls = (active: boolean) => `${side} ${active ? 'text-spruce' : 'text-mist'}`;

  return (
    <div className="mx-auto flex max-w-xl items-center gap-2 px-4 py-3">
      <ListLink className={cls(pathname === '/')}>
        <List className="size-5" aria-hidden="true" />
        Places
      </ListLink>
      <Link
        href="/places/new"
        className="flex h-12 flex-[2] items-center justify-center gap-2 rounded-lg bg-spruce font-display text-lg font-semibold uppercase tracking-wide text-white active:bg-spruce-deep"
      >
        <Plus className="size-5" aria-hidden="true" />
        Add place
      </Link>
      <Link
        href="/browse"
        aria-current={pathname.startsWith('/browse') ? 'page' : undefined}
        className={cls(pathname.startsWith('/browse'))}
      >
        <FolderTree className="size-5" aria-hidden="true" />
        Browse
      </Link>
      <Link
        href="/map"
        aria-current={pathname.startsWith('/map') ? 'page' : undefined}
        className={cls(pathname.startsWith('/map'))}
      >
        <MapIcon className="size-5" aria-hidden="true" />
        Map
      </Link>
    </div>
  );
}
