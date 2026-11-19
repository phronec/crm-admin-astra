'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
export async function setLanguage(form) {
  const next = form.get('lang');
  if (next !== 'cs' && next !== 'sk') return;
  (await cookies()).set('clevia-admin-language',next,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:31536000});
  revalidatePath('/','layout');
}
