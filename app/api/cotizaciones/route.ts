import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateItems, calcTotals } from '@/lib/cotizaciones/rules';
import { getCotizacionConfig, getNextNumero } from '@/lib/cotizaciones/db';
import type { WizardAnswers } from '@/types/cotizacion';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { nombre, contacto, answers }: { nombre: string; contacto: string; answers: WizardAnswers } =
    await req.json();

  const config = await getCotizacionConfig();
  const { items, plazo_estimado, mult } = generateItems(answers, config);
  const tarifa = answers.moneda === 'UYU' ? config.tarifa_hora_uyu : config.tarifa_hora_usd;
  const { subtotal, total } = calcTotals(items, mult, 0);
  const numero = await getNextNumero();

  const { data, error } = await supabase
    .from('cotizaciones')
    .insert({
      numero,
      estado: 'borrador',
      cliente_nombre: nombre.trim(),
      cliente_contacto: contacto.trim(),
      moneda: answers.moneda,
      tarifa_hora: tarifa,
      items,
      notas: '',
      descuento: 0,
      mult,
      subtotal,
      total,
      plazo_estimado,
      condiciones: config.condiciones_default,
      answers,
    })
    .select('id')
    .single();

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Error al crear' }, { status: 500 });

  return NextResponse.json({ id: data.id });
}
