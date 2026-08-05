'use client';

import 'leaflet/dist/leaflet.css';
import { divIcon, latLngBounds } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import type { PlaceStatusValue } from '@/db/schema';
import { STATUS_LABELS } from '@/lib/labels';

export type MapPlace = {
  id: string;
  name: string;
  status: PlaceStatusValue;
  latitude: number;
  longitude: number;
};

// Same status language as the trail blaze (DESIGN.md).
const PIN: Record<PlaceStatusValue, { bg: string; border: string }> = {
  want_to_go: { bg: '#ffffff', border: '#2c5e45' },
  been: { bg: '#2c5e45', border: '#ffffff' },
  favorite: { bg: '#d9480f', border: '#ffffff' },
  ruled_out: { bg: '#5c6b60', border: '#ffffff' },
};

function pinIcon(status: PlaceStatusValue) {
  const { bg, border } = PIN[status];
  return divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${bg};border:2px solid ${border};box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -22],
  });
}

export default function PlacesMapInner({
  places,
  home,
}: {
  places: MapPlace[];
  home: { lat: number; lng: number } | null;
}) {
  const points = places.map((p) => [p.latitude, p.longitude] as [number, number]);
  if (home) points.push([home.lat, home.lng]);

  const bounds = points.length ? latLngBounds(points).pad(0.15) : null;
  const fallbackCenter: [number, number] = home ? [home.lat, home.lng] : [39.5, -98.35];

  return (
    <MapContainer
      {...(bounds && points.length > 1 ? { bounds } : { center: fallbackCenter, zoom: 10 })}
      scrollWheelZoom
      className="h-full w-full"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {places.map((p) => (
        <Marker key={p.id} position={[p.latitude, p.longitude]} icon={pinIcon(p.status)}>
          <Popup>
            <span className="block font-bold">{p.name}</span>
            <span className="block text-xs">{STATUS_LABELS[p.status]}</span>
            <a href={`/places/${p.id}`} className="font-bold underline">
              Details
            </a>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
