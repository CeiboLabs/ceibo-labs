import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rateLimit';

const WINDOW_24H = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!checkRateLimit(`contact:${ip}`, 2, WINDOW_24H)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { name, email, message, projectType, budget, timeline, website } = await req.json();

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const row = (label: string, value: string) => value
    ? `<tr><td style="padding:8px 0;color:#888;width:140px;vertical-align:top;font-size:13px;">${label}</td><td style="padding:8px 0;color:#111;font-size:13px;">${value}</td></tr>`
    : '';

  const { error } = await resend.emails.send({
    from: 'Oriental Labs <info@orientalabs.dev>',
    to: 'info@orientalabs.dev',
    replyTo: email,
    subject: `Nuevo mensaje de ${name}${projectType ? ` — ${projectType}` : ''}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:8px;">
        <h2 style="color:#111;margin-bottom:4px;">Nuevo mensaje desde el formulario</h2>
        <p style="color:#888;font-size:13px;margin-bottom:24px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">orientalabs.dev</p>
        <table style="width:100%;border-collapse:collapse;">
          ${row('Nombre', name)}
          ${row('Email', `<a href="mailto:${email}" style="color:#3b82f6;">${email}</a>`)}
          ${row('Tipo de proyecto', projectType)}
          ${row('Presupuesto', budget)}
          ${row('Plazo', timeline)}
          ${row('Sitio actual', website ? `<a href="${website}" style="color:#3b82f6;">${website}</a>` : '')}
        </table>
        <div style="margin-top:20px;padding-top:20px;border-top:1px solid #e5e7eb;">
          <p style="color:#888;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Mensaje</p>
          <p style="color:#111;font-size:14px;white-space:pre-wrap;line-height:1.6;">${message}</p>
        </div>
      </div>
    `,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
