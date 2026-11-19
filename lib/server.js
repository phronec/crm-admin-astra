import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { authConfigured, authCookies } from './config';

export async function authClient() {
  const jar = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: authCookies,
    cookies: {
      getAll: () => jar.getAll(),
      setAll(values) {
        try {
          for (const { name, value, options } of values) jar.set(name, value, options);
        } catch {
          // Next.js only permits cookie updates inside an action, route handler or proxy.
        }
      }
    }
  });
}

export const requirePlatformAdmin = cache(async function requirePlatformAdmin() {
  if (!authConfigured()) redirect('/login?error=setup');
  const client = await authClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect('/login');
  const access = await client.rpc('is_platform_admin');
  if (access.error) throw new Error('Platform access could not be checked.');
  if (!access.data) redirect('/login?error=access');
  return { client, user };
});
