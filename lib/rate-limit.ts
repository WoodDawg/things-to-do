import 'server-only';

/**
 * In-memory sliding-window limiter. On serverless this state is per-instance,
 * so the limit is best-effort — acceptable here because the only consumer is
 * a single-user login form and the real backstop is the bcrypt hash.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
