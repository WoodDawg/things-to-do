import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { requireAuth } from '@/lib/auth';
import { BottomNav } from '@/components/BottomNav';
import { logout } from '@/app/login/actions';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gravel/10 bg-limestone/95 px-4 py-3 backdrop-blur">
        <Link
          href="/"
          className="font-display text-2xl font-bold uppercase tracking-wide text-spruce"
        >
          Things to do
        </Link>
        <form action={logout}>
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="flex size-10 items-center justify-center rounded-lg text-mist active:bg-card"
          >
            <LogOut className="size-5" aria-hidden="true" />
          </button>
        </form>
      </header>

      <main className="flex-1 px-4 pt-4">{children}</main>

      <footer className="px-4 pb-28 pt-8 text-xs text-mist">
        Geocoding © OpenStreetMap contributors, ODbL
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-gravel/10 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <BottomNav />
      </div>
    </div>
  );
}
