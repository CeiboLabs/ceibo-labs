'use server';

import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rateLimit';

const ALLOWED_EMAILS = [process.env.BRUNO_EMAIL, process.env.EMILIANO_EMAIL].filter(
  Boolean
) as string[];

export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  // Rate limit per IP
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';

  if (!checkRateLimit(ip, 5, 60_000)) {
    return { error: 'Too many login attempts. Please wait a minute.' };
  }

  // Allowlist check before hitting Supabase
  if (!ALLOWED_EMAILS.includes(email)) {
    return { error: 'Access denied.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: 'Invalid email or password.' };
  }

  // Set admin bypass cookie — allows passing maintenance mode redirects
  const cookieStore = await cookies();
  cookieStore.set('cl_admin', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  redirect('/admin');
}
