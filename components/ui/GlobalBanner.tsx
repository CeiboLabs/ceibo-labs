'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface Props {
  text?: string | null;
  linkUrl?: string | null;
  imageUrl?: string | null;
  title?: string | null;
  subtitle?: string | null;
  locale?: string;
}

export function GlobalBanner({ text, linkUrl, imageUrl, title, subtitle, locale }: Props) {
  const learnMore = locale === 'en' ? 'Learn more →' : 'Ver más →';
  const [visible, setVisible] = useState(false);

  const content = title || text || '';
  const storageKey = `banner_dismissed_${btoa(content).slice(0, 16)}`;

  useEffect(() => {
    if (content && !sessionStorage.getItem(storageKey)) {
      setVisible(true);
    }
  }, [storageKey, content]);

  function dismiss() {
    sessionStorage.setItem(storageKey, '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={dismiss}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-white dark:bg-navy-900 shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* Image */}
        {imageUrl && (
          <div className="relative w-full aspect-video">
            <Image
              src={imageUrl}
              alt={title || 'Banner'}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        {(title || subtitle || text) && (
          <div className="px-6 py-6 space-y-3">
            {title && (
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{subtitle}</p>
            )}
            {text && (
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{text}</p>
            )}
            {linkUrl && (
              <div className="pt-1">
                {linkUrl.startsWith('#') ? (
                  <button
                    onClick={() => {
                      dismiss();
                      setTimeout(() => {
                        document.querySelector(linkUrl)?.scrollIntoView({ behavior: 'smooth' });
                      }, 150);
                    }}
                    className="inline-block px-5 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-white text-sm font-semibold transition-colors"
                  >
                    {learnMore}
                  </button>
                ) : (
                  <a
                    href={linkUrl.startsWith('/') ? `/${locale}${linkUrl}` : linkUrl}
                    target={linkUrl.startsWith('/') ? '_self' : '_blank'}
                    rel={linkUrl.startsWith('/') ? undefined : 'noopener noreferrer'}
                    className="inline-block px-5 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-white text-sm font-semibold transition-colors"
                  >
                    {learnMore}
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
