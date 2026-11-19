'use server';
import { redirect,notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { requirePlatformAdmin } from '../../../../lib/server';
export async function settleOrder(form) {
  const {client}=await requirePlatformAdmin();
  const id=String(form.get('order')||'');
  if(!/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(id)) notFound();
  const url='/payments/'+id;
  if(form.get('received')!=='confirmed') redirect(url+'?result=confirmRequired');
  const {error}=await client.rpc('settle_workspace_order',{p_order:id});
  if(error) redirect(url+'?result=settlementFailed');
  revalidatePath('/','layout');
  redirect(url+'?result=paidResult');
}
