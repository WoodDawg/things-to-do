import type { Place } from '@/db/schema';

// Per spec §7: URLs are generated at render time, never stored.
// Apple links use ll + q (post-iOS 18.4 unified schema); mapUrlOverride wins.

export function appleMapsUrl(place: Place): string {
  if (place.mapUrlOverride) return place.mapUrlOverride;
  if (place.latitude != null && place.longitude != null) {
    return `https://maps.apple.com/?ll=${place.latitude},${place.longitude}&q=${encodeURIComponent(place.name)}`;
  }
  return `https://maps.apple.com/?q=${encodeURIComponent(`${place.name} ${place.address ?? ''} ${place.state}`)}`;
}

export function googleMapsUrl(place: Place): string {
  if (place.latitude != null && place.longitude != null) {
    return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address ?? ''} ${place.state}`)}`;
}

export function googleDirectionsUrl(place: Place): string | null {
  if (place.latitude == null || place.longitude == null) return null;
  return `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
}
