'use server';

import { createClient } from '@/lib/supabase/server';
import type { AuditEntry } from '@/lib/audit';

/**
 * Server-action wrapper for client components.
 * Uses getSession (no network call) since middleware already verified the JWT.
 * Reuses the same client for session read + DB insert to avoid double cookie parse.
 */
export async function logAuditAction(
  entry: Omit<AuditEntry, 'actorEmail'>
): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('audit_logs').insert({
      action:      entry.action,
      actor_email: session.user.email ?? 'unknown',
      entity_type: entry.entityType  ?? null,
      entity_id:   entry.entityId    ?? null,
      entity_slug: entry.entitySlug  ?? null,
      before:      entry.before      ?? null,
      after:       entry.after       ?? null,
      metadata:    entry.metadata    ?? null,
    });
  } catch {
    // Audit logging must never crash the app
  }
}
