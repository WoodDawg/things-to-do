'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pencil, Trash2, Undo2 } from 'lucide-react';

const OPEN_PX = 128;
const FULL_SWIPE_RATIO = 0.55; // of row width -> delete
const UNDO_MS = 5000;

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
  const [pendingDelete, setPendingDelete] = useState(false);
  const [gone, setGone] = useState(false);
  const drag = useRef<DragState | null>(null);
  const moved = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);
  const pendingRef = useRef(false);
  const sentRef = useRef(false);

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

  const commitDelete = useCallback(() => {
    if (sentRef.current || !pendingRef.current) return;
    sentRef.current = true;
    void deleteAction();
  }, [deleteAction]);

  // If the component unmounts (navigation) while an undo window is open,
  // commit the delete immediately — nothing silently comes back later.
  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      commitDelete();
    },
    [commitDelete],
  );

  function requestDelete() {
    if (activeClose === close) activeClose = null;
    pendingRef.current = true;
    setPendingDelete(true);
    timerRef.current = window.setTimeout(() => {
      commitDelete();
      setGone(true);
    }, UNDO_MS);
  }

  function undoDelete() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    pendingRef.current = false;
    setPendingDelete(false);
    setOffset(0);
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
        requestDelete();
        return 0;
      }
      if (o < -OPEN_PX / 2) {
        claimActive();
        return -OPEN_PX;
      }
      if (activeClose === close) activeClose = null;
      return 0;
    });
  }

  if (gone) return null;

  if (pendingDelete) {
    return (
      <div className="flex min-h-14 items-center justify-between gap-3 rounded-xl bg-gravel px-4 text-sm text-white">
        <span className="min-w-0 truncate">
          Deleted <span className="font-bold">“{name}”</span>
        </span>
        <button
          type="button"
          onClick={undoDelete}
          className="flex min-h-10 shrink-0 items-center gap-1 font-bold underline"
        >
          <Undo2 className="size-4" aria-hidden="true" />
          Undo
        </button>
      </div>
    );
  }

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
