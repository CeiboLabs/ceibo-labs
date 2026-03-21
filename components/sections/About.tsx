'use client';

import { SectionHeader } from '@/components/ui/SectionHeader';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { useTranslation } from '@/lib/i18n/context';

export function About() {
  const { t } = useTranslation();

  return (
    <section id="about" aria-label="About Ceibo Labs" className="relative py-24 sm:py-32 bg-navy-950">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-electric-400/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Brand story */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <SectionHeader
            eyebrow={t.about.storyEyebrow}
            title={t.about.storyTitle}
            description=""
            align="left"
          />
          <AnimatedSection direction="left">
            <div className="space-y-4 text-slate-400 text-lg leading-relaxed">
              <p>{t.about.storyP1}</p>
              <p>{t.about.storyP2}</p>
              <p className="text-slate-300 font-medium">{t.about.storyP3}</p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
