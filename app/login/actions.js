'use server';

import { redirect } from 'next/navigation';
import { authClient } from '../../lib/server';
import { authConfigured } from '../../lib/config';

export async function signIn(form) {
  if (!authConfigured()) redirect('/login?error=setup');
  const email = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  if (!email || !password || email.length > 320 || password.length > 4096) redirect('/login?error=credentials');
  const client = await authClient();
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) redirect('/login?error=credentials');
  const access = await client.rpc('is_platform_admin');
  if (access.error || !access.data) {
    await client.auth.signOut({ scope: 'local' });
    redirect(access.error ? '/login?error=unavailable' : '/login?error=access');
  }
  redirect('/');
}

export async function signOut() {
  const client = await authClient();
  await client.auth.signOut({ scope: 'local' });
  redirect('/login');
}
