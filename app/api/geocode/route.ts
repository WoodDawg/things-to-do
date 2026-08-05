import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '@/lib/auth-constants';
import { verifySessionToken } from '@/lib/auth';
import { geocode } from '@/lib/geocoder';
import { STATE_CODES } from '@/lib/states';

export async function POST(request: Request) {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: { address?: unknown; state?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 });
  }

  const address = typeof body.address === 'string' ? body.address.trim() : '';
  const stateRaw = typeof body.state === 'string' ? body.state.trim().toUpperCase() : '';
  const state = STATE_CODES.has(stateRaw) ? stateRaw : undefined;
  if (address.length < 2) {
    return NextResponse.json({ result: null });
  }

  const result = await geocode(address, state);
  return NextResponse.json({ result });
}
