'use client';

import 'leaflet/dist/leaflet.css';
import { divIcon, type Marker as LeafletMarker } from 'leaflet';
import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

type Props = {
  latitude: number;
  longitude: number;
  onMove: (lat: number, lng: number) => void;
};

export default function MapPreview({ latitude, longitude, onMove }: Props) {
  const icon = useMemo(
    () =>
      divIcon({
        className: '',
        html: '<div class="ttd-pin"></div>',
        iconSize: [24, 24],
        iconAnchor: [12, 24],
      }),
    [],
  );

  return (
    <div className="h-56 overflow-hidden rounded-xl border border-gravel/15">
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker
          position={[latitude, longitude]}
          draggable
          icon={icon}
          eventHandlers={{
            dragend: (e) => {
              const p = (e.target as LeafletMarker).getLatLng();
              onMove(p.lat, p.lng);
            },
          }}
        />
        <Recenter lat={latitude} lng={longitude} />
      </MapContainer>
    </div>
  );
}
