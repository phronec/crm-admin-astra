export function authConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export const authCookies = {
  name: 'clevia-platform-session',
  path: '/',
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production'
};
