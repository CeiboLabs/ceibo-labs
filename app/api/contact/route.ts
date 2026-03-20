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

  const [internalResult, confirmationResult] = await Promise.all([
    // Email interno a Ceibo Labs
    resend.emails.send({
      from: 'Ceibo Labs <info@ceibolabs.dev>',
      to: 'info@ceibolabs.dev',
      replyTo: email,
      subject: `Nuevo mensaje de ${name}${projectType ? ` — ${projectType}` : ''}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:8px;">
          <h2 style="color:#111;margin-bottom:4px;">Nuevo mensaje desde el formulario</h2>
          <p style="color:#888;font-size:13px;margin-bottom:24px;border-bottom:1px solid #e5e7eb;padding-bottom:16px;">ceibolabs.dev</p>
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
    }),
    // Email de confirmación al cliente
    resend.emails.send({
      from: 'Ceibo Labs <no-reply@ceibolabs.dev>',
      to: email,
      replyTo: 'info@ceibolabs.dev',
      subject: '¡Recibimos tu mensaje! / We got your message!',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#f9fafb;border-radius:8px;">
          <div style="background:#000000;padding:20px 24px;border-radius:8px;margin-bottom:24px;display:flex;align-items:center;gap:10px;">
            <span style="font-size:22px;font-weight:bold;color:#fff;">Ceibo <span style="color:#7ED9B6;">Labs</span></span>
          </div>
          <h2 style="color:#111;margin-bottom:8px;">Hola, ${name} 👋</h2>
          <p style="color:#444;font-size:15px;line-height:1.6;margin-bottom:16px;">
            Recibimos tu mensaje y te respondemos <strong>dentro de las próximas horas</strong>.
          </p>
          <p style="color:#444;font-size:15px;line-height:1.6;margin-bottom:24px;">
            Si necesitás contactarnos directamente podés escribirnos a
            <a href="mailto:info@ceibolabs.dev" style="color:#1A7A50;font-weight:600;">info@ceibolabs.dev</a>
            o por <a href="https://wa.me/59892654214" style="color:#25D366;font-weight:600;">WhatsApp</a>.
          </p>
          <div style="background:#f0fdf4;border:1px solid #d1fae5;border-radius:8px;padding:16px;margin-bottom:24px;">
            <p style="color:#166534;font-size:13px;margin:0;line-height:1.5;">
              <strong>¿Querés saber más sobre nuestros servicios?</strong><br/>
              Visitá <a href="https://ceibolabs.dev" style="color:#1A7A50;">ceibolabs.dev</a> para ver nuestros proyectos y servicios.
            </p>
          </div>
          <div style="border-top:1px solid #e5e7eb;padding-top:20px;text-align:center;">
            <p style="color:#888;font-size:12px;margin:0;">
              <a href="https://ceibolabs.dev" style="color:#1A7A50;text-decoration:none;font-weight:600;">ceibolabs.dev</a>
              &nbsp;·&nbsp; Ceibo Labs &nbsp;·&nbsp; Montevideo, Uruguay
            </p>
            <p style="color:#bbb;font-size:11px;margin:6px 0 0;">Este mensaje fue enviado automáticamente desde no-reply@ceibolabs.dev. Para responder escribí a <a href="mailto:info@ceibolabs.dev" style="color:#1A7A50;">info@ceibolabs.dev</a>.</p>
          </div>
        </div>
      `,
    }),
  ]);

  if (internalResult.error) {
    return NextResponse.json({ error: internalResult.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
