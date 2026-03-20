'use server';

import { createClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/audit';

export async function clearLogsAction(): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  // Delete all rows — Supabase client requires a filter for bulk deletes
  const { error } = await supabase
    .from('audit_logs')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) return { error: error.message };

  // Insert a single marker entry (will be the only row after clear)
  logAudit({
    action:     'logs.clear',
    actorEmail: user.email ?? 'unknown',
    entityType: 'logs',
  });

  return { error: null };
}
