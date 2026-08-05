import 'server-only';

/**
 * Nominatim geocoder — the single swap point if we ever outgrow it
 * (LocationIQ / Geoapify take the same shape).
 *
 * Usage-policy compliance (https://operations.osmfoundation.org/policies/nominatim/):
 * - identifying User-Agent from GEOCODER_USER_AGENT
 * - minimum 1.1s gap between outbound requests (per server instance; every call
 *   in this app is one user saving one place, so bursts don't exist in practice)
 * - callers cache results on the row (latitude/longitude/geocodedAt) and only
 *   re-geocode when the address text actually changes
 * - NEVER call this in a loop or from a script; no batch geocoding, ever
 */

export type GeocodeResult = { latitude: number; longitude: number };

const MIN_GAP_MS = 1100;
let lastRequestAt = 0;
let queue: Promise<unknown> = Promise.resolve();

async function throttled<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const wait = lastRequestAt + MIN_GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();
    return fn();
  });
  queue = run.catch(() => {});
  return run;
}

export async function geocode(address: string, state?: string): Promise<GeocodeResult | null> {
  const userAgent = process.env.GEOCODER_USER_AGENT;
  if (!userAgent) {
    console.warn('GEOCODER_USER_AGENT is not set — refusing to call Nominatim without it');
    return null;
  }

  const q = state ? `${address}, ${state}` : address;
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'us');

  try {
    const res = await throttled(() =>
      fetch(url, {
        headers: { 'User-Agent': userAgent },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      }),
    );
    if (!res.ok) return null;

    const data: Array<{ lat: string; lon: string }> = await res.json();
    if (!data.length) return null;

    const latitude = Number.parseFloat(data[0].lat);
    const longitude = Number.parseFloat(data[0].lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

    return { latitude, longitude };
  } catch {
    // Degrade silently per spec — the save must never depend on this.
    return null;
  }
}
