'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Logo } from '@/components/ui/Logo';
import { loginAction } from './actions';

function LoginForm() {
  const searchParams = useSearchParams();
  const isUnauthorized = searchParams.get('error') === 'unauthorized';

  const [state, formAction, pending] = useActionState(loginAction, { error: null });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex justify-center mb-10">
          <Logo />
        </div>

        <div className="rounded-2xl bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-700/40 p-8 shadow-sm dark:shadow-none">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Admin login</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Founders only.</p>

          {isUnauthorized && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              This email is not authorized to access admin.
            </div>
          )}

          {state?.error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-300 dark:border-navy-600/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-electric-400/50 focus:ring-1 focus:ring-electric-400/30 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-navy-800/60 border border-slate-300 dark:border-navy-600/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-electric-400/50 focus:ring-1 focus:ring-electric-400/30 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full py-2.5 rounded-xl bg-electric-400 hover:bg-electric-300 text-navy-950 font-semibold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
