import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { calcTotals } from '@/lib/cotizaciones/rules';
import { getNextNumero } from '@/lib/cotizaciones/db';
import type { QuoteItem, Condiciones } from '@/types/cotizacion';

async function auth() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return supabase;
}

// ── PATCH: update content OR update estado ─────────────────────────────────
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await auth();
  if (!supabase) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  // Update estado only
  if ('estado' in body && Object.keys(body).length === 1) {
    const { error } = await supabase.from('cotizaciones').update({ estado: body.estado }).eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath('/admin/cotizaciones');
    return NextResponse.json({ ok: true });
  }

  // Full update (editor)
  const fields: {
    items: QuoteItem[];
    notas: string;
    descuento: number;
    mult: number;
    plazo_estimado: string;
    condiciones: Condiciones;
    cliente_nombre: string;
    cliente_contacto: string;
    estado: 'borrador' | 'enviada' | 'aceptada' | 'rechazada';
  } = body;

  const { subtotal, total } = calcTotals(fields.items, fields.mult, fields.descuento);
  const { error } = await supabase.from('cotizaciones').update({
    estado: fields.estado,
    items: fields.items,
    notas: fields.notas,
    descuento: fields.descuento,
    mult: fields.mult,
    subtotal,
    total,
    plazo_estimado: fields.plazo_estimado,
    condiciones: fields.condiciones,
    cliente_nombre: fields.cliente_nombre,
    cliente_contacto: fields.cliente_contacto,
  }).eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/admin/cotizaciones');
  return NextResponse.json({ ok: true });
}

// ── DELETE ─────────────────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await auth();
  if (!supabase) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const { error } = await supabase.from('cotizaciones').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath('/admin/cotizaciones');
  return NextResponse.json({ ok: true });
}

// ── POST: duplicate ────────────────────────────────────────────────────────
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await auth();
  if (!supabase) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await params;
  const { data: original } = await supabase.from('cotizaciones').select('*').eq('id', id).single();
  if (!original) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });

  const numero = await getNextNumero();
  const { data: copy, error } = await supabase.from('cotizaciones').insert({
    numero,
    estado: 'borrador',
    cliente_nombre:   original.cliente_nombre,
    cliente_contacto: original.cliente_contacto,
    moneda:           original.moneda,
    tarifa_hora:      original.tarifa_hora,
    items:            original.items,
    notas:            original.notas,
    descuento:        original.descuento,
    mult:             original.mult,
    subtotal:         original.subtotal,
    total:            original.total,
    plazo_estimado:   original.plazo_estimado,
    condiciones:      original.condiciones,
    answers:          original.answers,
  }).select('id').single();

  if (error || !copy) return NextResponse.json({ error: error?.message ?? 'Error al duplicar' }, { status: 500 });
  revalidatePath('/admin/cotizaciones');
  return NextResponse.json({ id: copy.id });
}
