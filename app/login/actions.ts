'use server';

import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionCookie } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

export type LoginState = { error: string | null };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

  if (!rateLimit(`login:${ip}`)) {
    return { error: 'Too many attempts. Wait a minute, then try again.' };
  }

  const hash = process.env.APP_PASSWORD_HASH;
  if (!hash) {
    return { error: 'Server is missing APP_PASSWORD_HASH. Set it and redeploy.' };
  }

  const password = formData.get('password');
  if (typeof password !== 'string' || password.length === 0) {
    return { error: 'Enter the password.' };
  }

  const ok = await bcrypt.compare(password, hash);
  if (!ok) {
    return { error: 'Wrong password. Check it and try again.' };
  }

  await createSessionCookie();
  redirect('/');
}
