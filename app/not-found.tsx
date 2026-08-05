import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide">Not found</h1>
      <p className="text-mist">That place doesn&apos;t exist — it may have been deleted.</p>
      <Link href="/" className="font-bold text-spruce underline">
        Back to the list
      </Link>
    </main>
  );
}
