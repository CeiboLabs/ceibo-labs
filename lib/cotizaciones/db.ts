import { createClient } from '@/lib/supabase/server';
import { DEFAULT_CONFIG } from './defaults';
import type { Cotizacion, CotizacionConfig } from '@/types/cotizacion';

export async function getCotizaciones(): Promise<Cotizacion[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('cotizaciones')
    .select('*')
    .order('created_at', { ascending: false });
  return (data ?? []) as Cotizacion[];
}

export async function getCotizacion(id: string): Promise<Cotizacion | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('cotizaciones')
    .select('*')
    .eq('id', id)
    .single();
  return (data as Cotizacion) ?? null;
}

export async function getCotizacionByToken(token: string): Promise<Cotizacion | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('cotizaciones')
    .select('*')
    .eq('id', token) // we use the UUID id as the public token
    .single();
  return (data as Cotizacion) ?? null;
}

export async function getCotizacionConfig(): Promise<CotizacionConfig> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('cotizacion_config')
    .select('*')
    .eq('id', 1)
    .single();
  return (data as CotizacionConfig) ?? DEFAULT_CONFIG;
}

export async function getNextNumero(): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const { count } = await supabase
    .from('cotizaciones')
    .select('id', { count: 'exact', head: true });
  return `CL-${year}-${String((count ?? 0) + 1).padStart(3, '0')}`;
}
