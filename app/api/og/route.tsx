import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';

export const runtime = 'edge';

// ── Logo cache (persists across requests in the same edge isolate) ──────────
let cachedLogoSrc: string | null = null;

async function getLogoSrc(baseUrl: string): Promise<string> {
  if (cachedLogoSrc) return cachedLogoSrc;
  try {
    const res = await fetch(`${baseUrl}/images/logo-mark.svg`);
    if (res.ok) {
      const text = await res.text();
      cachedLogoSrc = `data:image/svg+xml,${encodeURIComponent(text)}`;
      return cachedLogoSrc;
    }
  } catch {}
  return '';
}

// ── Handler ─────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const type  = searchParams.get('type')  ?? 'home';
  const title = searchParams.get('title') ?? (type === 'home' ? 'Ceibo Labs' : '');

  const defaultSubtitle = 'Web, AI & software products built in Uruguay.';
  const subtitle = searchParams.get('subtitle') ?? defaultSubtitle;

  const typeLabel =
    type === 'project' ? 'Project'
    : type === 'blog'  ? 'Blog Post'
    : null;

  const baseUrl = new URL(request.url).origin;
  const logoSrc = await getLogoSrc(baseUrl);

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          background: '#0A1F1A',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Dot grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(126,217,182,0.07) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow — top right (deep green) */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-80px',
            width: '520px',
            height: '520px',
            background: 'radial-gradient(ellipse, rgba(47,169,127,0.28) 0%, transparent 68%)',
            borderRadius: '50%',
          }}
        />

        {/* Glow — bottom left (mint) */}
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '60px',
            width: '640px',
            height: '420px',
            background: 'radial-gradient(ellipse, rgba(126,217,182,0.16) 0%, transparent 68%)',
            borderRadius: '50%',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            padding: '52px 64px',
            justifyContent: 'space-between',
          }}
        >
          {/* ── Top bar ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {logoSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoSrc} width={44} height={44} alt="" style={{ objectFit: 'contain' }} />
              ) : (
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    background: 'linear-gradient(135deg, #7ED9B6, #2FA97F)',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '22px',
                    fontWeight: 800,
                  }}
                >
                  C
                </div>
              )}
              <span
                style={{
                  color: '#94A3B8',
                  fontSize: '17px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                Ceibo Labs
              </span>
            </div>

            {/* Type pill */}
            {typeLabel && (
              <div
                style={{
                  display: 'flex',
                  padding: '8px 20px',
                  border: '1px solid rgba(126,217,182,0.35)',
                  borderRadius: '999px',
                  color: '#7ED9B6',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  background: 'rgba(126,217,182,0.07)',
                }}
              >
                {typeLabel}
              </div>
            )}
          </div>

          {/* ── Main content ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '960px' }}>
            {/* Accent bar */}
            <div
              style={{
                width: '52px',
                height: '4px',
                background: 'linear-gradient(90deg, #7ED9B6, #2FA97F)',
                borderRadius: '2px',
              }}
            />

            {/* Title */}
            <div
              style={{
                color: '#F8FAFC',
                fontSize: '60px',
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                maxWidth: '960px',
                wordBreak: 'break-word',
              }}
            >
              {title || 'Ceibo Labs'}
            </div>

            {/* Subtitle */}
            <div
              style={{
                color: '#94A3B8',
                fontSize: '22px',
                lineHeight: 1.5,
                fontWeight: 400,
                maxWidth: '740px',
              }}
            >
              {subtitle}
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <span style={{ color: '#334155', fontSize: '14px', letterSpacing: '0.05em' }}>
              ceibolabs.dev
            </span>
          </div>
        </div>

        {/* Bottom gradient line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent 0%, #7ED9B6 30%, #2FA97F 70%, transparent 100%)',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}
