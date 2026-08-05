'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const OPEN_PX = 128;
const FULL_SWIPE_RATIO = 0.55; // of row width -> delete

// Module-level registry so only one row is ever open at a time.
let activeClose: (() => void) | null = null;

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
  const rootRef = useRef<HTMLDivElement>(null);
  const [, startTransition] = useTransition();

  const close = useCallback(() => {
    setOffset(0);
    if (activeClose === close) activeClose = null;
  }, []);

  function claimActive() {
    if (activeClose && activeClose !== close) activeClose();
    activeClose = close;
  }

  // Any scroll snaps the open row shut.
  useEffect(() => {
    if (offset === 0) return;
    const onScroll = () => close();
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', onScroll, { capture: true });
  }, [offset === 0, close]);

  function requestDelete() {
    if (window.confirm(`Delete “${name}”? This cannot be undone.`)) {
      setDeleted(true); // optimistic
      if (activeClose === close) activeClose = null;
      startTransition(() => deleteAction());
    } else {
      close();
    }
  }

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
        claimActive();
        setDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      }
    }
    if (!s.horizontal) return;
    moved.current = true;
    const width = rootRef.current?.clientWidth ?? 400;
    setOffset(Math.min(0, Math.max(-width, s.base + dx)));
  }

  function onPointerEnd() {
    const s = drag.current;
    drag.current = null;
    setDragging(false);
    if (!s || s.horizontal !== true) return;
    const width = rootRef.current?.clientWidth ?? 400;
    setOffset((o) => {
      if (o < -width * FULL_SWIPE_RATIO) {
        // full swipe across the row -> delete (confirm still guards it)
        requestDelete();
        return o;
      }
      if (o < -OPEN_PX / 2) {
        claimActive();
        return -OPEN_PX;
      }
      if (activeClose === close) activeClose = null;
      return 0;
    });
  }

  if (deleted) return null;

  const width = rootRef.current?.clientWidth ?? 400;
  const pastFullSwipe = offset < -width * FULL_SWIPE_RATIO;

  return (
    <div
      ref={rootRef}
      className={`relative overflow-hidden rounded-xl ${pastFullSwipe ? 'bg-blaze' : ''}`}
    >
      <div className="absolute inset-y-0 right-0 flex w-32" aria-hidden={offset === 0}>
        <Link
          href={editHref}
          tabIndex={offset === 0 ? -1 : 0}
          className={`flex flex-1 flex-col items-center justify-center gap-1 text-xs font-bold text-white ${pastFullSwipe ? 'bg-blaze' : 'bg-spruce'}`}
        >
          <Pencil className="size-4" aria-hidden="true" />
          Edit
        </Link>
        <button
          type="button"
          tabIndex={offset === 0 ? -1 : 0}
          onClick={requestDelete}
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
            e.preventDefault();
            e.stopPropagation();
            moved.current = false;
          } else if (offset !== 0) {
            e.preventDefault();
            e.stopPropagation();
            close();
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
