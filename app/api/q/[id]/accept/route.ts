import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { error } = await supabase
    .from('cotizaciones')
    .update({ estado: 'aceptada' })
    .eq('id', id)
    .in('estado', ['borrador', 'enviada']);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath(`/q/${id}`);
  revalidatePath('/admin/cotizaciones');
  return NextResponse.json({ ok: true });
}
