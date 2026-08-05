'use client';

import dynamic from 'next/dynamic';
import type { MapPlace } from '@/components/PlacesMapInner';

// Leaflet touches `window` at import time — client-only.
const Inner = dynamic(() => import('@/components/PlacesMapInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-mist">Loading map…</div>
  ),
});

export function PlacesMap(props: {
  places: MapPlace[];
  home: { lat: number; lng: number } | null;
}) {
  return <Inner {...props} />;
}
