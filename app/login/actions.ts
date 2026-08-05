'use server';

import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { clearSessionCookie, createSessionCookie } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (!rateLimit(`login:${ip}`)) {
    return { error: 'Too many attempts. Wait a minute, then try again.' };
  }

  const expectedUser = process.env.APP_USERNAME;
  const hash = process.env.APP_PASSWORD_HASH;
  if (!expectedUser || !hash) {
    return { error: 'Server is missing APP_USERNAME or APP_PASSWORD_HASH. Set them and redeploy.' };
  }

  const username = String(formData.get('username') ?? '').trim();
  const password = formData.get('password');
  if (!username || typeof password !== 'string' || password.length === 0) {
    return { error: 'Enter the username and password.' };
  }

  // Always run the bcrypt compare so a wrong username costs the same time as
  // a wrong password (no username-probing oracle).
  const userOk = username.toLowerCase() === expectedUser.toLowerCase();
  const passOk = await bcrypt.compare(password, hash);
  if (!userOk || !passOk) {
    return { error: 'Wrong username or password. Check them and try again.' };
  }

  await createSessionCookie();
  redirect('/');
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect('/login');
}
