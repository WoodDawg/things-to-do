'use client';

export function DeleteButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm('Delete this place? This cannot be undone.')) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="h-11 w-full rounded-lg border border-blaze font-display text-lg font-semibold uppercase tracking-wide text-blaze"
      >
        Delete
      </button>
    </form>
  );
}
