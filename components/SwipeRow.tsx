'use client';

import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const OPEN_PX = 128;

type DragState = { x: number; y: number; base: number; horizontal: boolean | null };

export function SwipeRow({
  name,
  editHref,
  deleteAction,
  children,
}: {
  name: string;
  editHref: string;
  deleteAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const drag = useRef<DragState | null>(null);
  const moved = useRef(false);
  const [, startTransition] = useTransition();

  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, base: offset, horizontal: null };
    moved.current = false;
  }

  function onPointerMove(e: React.PointerEvent) {
    const s = drag.current;
    if (!s) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (s.horizontal === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      s.horizontal = Math.abs(dx) > Math.abs(dy);
      if (s.horizontal) {
        setDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      }
    }
    if (!s.horizontal) return;
    moved.current = true;
    setOffset(Math.min(0, Math.max(-OPEN_PX, s.base + dx)));
  }

  function onPointerEnd() {
    const s = drag.current;
    drag.current = null;
    setDragging(false);
    if (!s || s.horizontal !== true) return;
    setOffset((o) => (o < -OPEN_PX / 2 ? -OPEN_PX : 0));
  }

  if (deleted) return null;

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-y-0 right-0 flex w-32" aria-hidden={offset === 0}>
        <Link
          href={editHref}
          tabIndex={offset === 0 ? -1 : 0}
          className="flex flex-1 flex-col items-center justify-center gap-1 bg-spruce text-xs font-bold text-white"
        >
          <Pencil className="size-4" aria-hidden="true" />
          Edit
        </Link>
        <button
          type="button"
          tabIndex={offset === 0 ? -1 : 0}
          onClick={() => {
            if (window.confirm(`Delete “${name}”? This cannot be undone.`)) {
              setDeleted(true); // optimistic
              startTransition(() => deleteAction());
            } else {
              setOffset(0);
            }
          }}
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-r-xl bg-blaze text-xs font-bold text-white"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </button>
      </div>

      <div
        className="touch-pan-y"
        style={{
          transform: `translateX(${offset}px)`,
          transition: dragging ? 'none' : 'transform 0.18s ease-out',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={(e) => {
          if (moved.current) {
            // this "click" was the tail end of a drag — swallow it
            e.preventDefault();
            e.stopPropagation();
            moved.current = false;
          } else if (offset > 0) {
            // tap while open just closes the row
            e.preventDefault();
            e.stopPropagation();
            setOffset(0);
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
