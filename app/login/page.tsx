'use client';

import { useActionState } from 'react';
import { login, type LoginState } from './actions';

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-4">
      <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-spruce">
        Things to do
      </h1>
      <p className="mt-1 text-mist">Private — sign in required.</p>

      <form action={formAction} className="mt-8 flex flex-col gap-3">
        <label htmlFor="username" className="sr-only">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          autoFocus
          required
          className="h-12 rounded-lg border border-gravel/25 bg-card px-4 text-base"
          placeholder="Username"
        />
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 rounded-lg border border-gravel/25 bg-card px-4 text-base"
          placeholder="Password"
        />
        {state.error ? (
          <p role="alert" className="text-sm font-bold text-blaze">
            {state.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-lg bg-spruce font-display text-lg font-semibold uppercase tracking-wide text-white disabled:opacity-60"
        >
          {pending ? 'Checking…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
