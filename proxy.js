import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { authConfigured, authCookies } from './lib/config';

export async function proxy(request) {
  let response = NextResponse.next({ request });
  if (authConfigured()) {
    const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
      cookieOptions: authCookies,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          for (const { name, value } of values) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of values) response.cookies.set(name, value, options);
        }
      }
    });
    await client.auth.getUser();
  }
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Referrer-Policy', 'same-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|fonts/|favicon.ico|robots.txt).*)'] };
