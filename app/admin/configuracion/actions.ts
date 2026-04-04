'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { CatalogoItem, Condiciones } from '@/types/cotizacion';

export async function saveConfigAction(
  _prev: { error: string | null; ok: boolean },
  formData: FormData
): Promise<{ error: string | null; ok: boolean }> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'No autenticado', ok: false };

  // Parse catalog JSON sent as hidden field
  let catalogo: CatalogoItem[] = [];
  try {
    catalogo = JSON.parse(formData.get('catalogo') as string ?? '[]');
  } catch {
    return { error: 'Catálogo inválido', ok: false };
  }

  const condiciones: Condiciones = {
    pago:       (formData.get('cond_pago') as string) ?? '',
    entrega:    (formData.get('cond_entrega') as string) ?? '',
    revisiones: (formData.get('cond_revisiones') as string) ?? '',
    soporte:    (formData.get('cond_soporte') as string) ?? '',
    ip:         (formData.get('cond_ip') as string) ?? '',
    respuesta:  (formData.get('cond_respuesta') as string) ?? '',
  };

  const payload = {
    id: 1,
    tarifa_hora_uyu:   parseFloat(formData.get('tarifa_hora_uyu') as string) || 800,
    tarifa_hora_usd:   parseFloat(formData.get('tarifa_hora_usd') as string) || 20,
    mult_urgencia:     parseFloat(formData.get('mult_urgencia') as string) || 1.3,
    mult_sin_brief:    parseFloat(formData.get('mult_sin_brief') as string) || 1.15,
    empresa_nombre:    (formData.get('empresa_nombre') as string) ?? 'Ceibo Labs',
    empresa_email:     (formData.get('empresa_email') as string) ?? 'info@ceibolabs.dev',
    empresa_rut:       (formData.get('empresa_rut') as string) || null,
    condiciones_default: condiciones,
    catalogo,
  };

  const { error } = await supabase
    .from('cotizacion_config')
    .upsert(payload, { onConflict: 'id' });

  if (error) return { error: error.message, ok: false };

  revalidatePath('/admin/configuracion');
  return { error: null, ok: true };
}
