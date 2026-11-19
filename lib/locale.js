import 'server-only';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';
export const language = cache(async function language() {
  const value = (await cookies()).get('clevia-admin-language')?.value;
  if (value === 'sk' || value === 'cs') return value;
  return (await headers()).get('accept-language')?.toLowerCase().startsWith('sk') ? 'sk' : 'cs';
});
