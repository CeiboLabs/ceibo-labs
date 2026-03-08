'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { useTranslation } from '@/lib/i18n/context';
import { pickI18n } from '@/lib/i18n-content';
import type { Review } from '@/types/review';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
        />
      ))}
    </div>
  );
}

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-electric-400/15 border border-electric-400/30 flex items-center justify-center flex-shrink-0">
      <span className="text-electric-400 text-xs font-bold">{initials}</span>
    </div>
  );
}

interface Props {
  dbReviews?: Review[];
}

export function Testimonials({ dbReviews }: Props) {
  const { locale, t } = useTranslation();

  if (!dbReviews || dbReviews.length === 0) return null;

  return (
    <section
      id="testimonials"
      aria-label="Testimonials"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-navy-950 via-navy-900/40 to-navy-950"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-electric-400/30 to-transparent" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-radial from-electric-500/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <SectionHeader
          eyebrow={t.testimonials.eyebrow}
          title={t.testimonials.title}
          description={t.testimonials.description}
        />

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {dbReviews.map((review) => (
            <StaggerItem key={review.id}>
              <div className="flex flex-col h-full p-6 rounded-2xl bg-navy-800/60 border border-navy-600/50 hover:border-electric-400/25 hover:shadow-glow transition-all duration-300">
                <StarRating rating={review.rating} />

                <blockquote className="mt-4 mb-6 flex-1">
                  <p className="text-slate-300 text-sm leading-relaxed break-words">
                    &ldquo;{pickI18n(review.quote_i18n, locale) || review.quote}&rdquo;
                  </p>
                </blockquote>

                <div className="mt-auto space-y-3">
                  {review.project_slug && (
                    <Link
                      href={`/${locale}/projects/${review.project_slug}`}
                      className="inline-flex items-center gap-1 text-xs text-electric-400 hover:text-electric-300 transition-colors"
                    >
                      Related project →
                    </Link>
                  )}

                  <div className="flex items-center gap-3 pt-3 border-t border-navy-600/40">
                    {review.author_avatar_url ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={review.author_avatar_url}
                          alt={review.author_name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <AvatarFallback name={review.author_name} />
                    )}
                    <div>
                      <p className="text-white text-sm font-semibold">{review.author_name}</p>
                      {(review.author_title_i18n || review.author_title || review.author_company) && (
                        <p className="text-slate-500 text-xs">
                          {[pickI18n(review.author_title_i18n, locale) || review.author_title, review.author_company].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
