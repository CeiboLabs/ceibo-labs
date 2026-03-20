'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MapPin, Github, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StaggerContainer, StaggerItem, AnimatedSection } from '@/components/ui/AnimatedSection';
import { useTranslation } from '@/lib/i18n/context';
import { founders } from '@/lib/data/founders';

function FounderAvatar({ name, avatar }: { name: string; avatar: string }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('');

  return (
    <div className="relative w-36 h-36 rounded-full ring-2 ring-electric-400/50 overflow-hidden bg-navy-700 flex items-center justify-center shrink-0">
      {!failed ? (
        <Image
          src={avatar}
          alt={`Photo of ${name}`}
          fill
          className="object-cover object-center"
          sizes="144px"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="text-2xl font-bold text-electric-400 select-none">{initials}</span>
      )}
    </div>
  );
}

export function About() {
  const { locale, t } = useTranslation();

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

        {/* Founders */}
        <div>
          <AnimatedSection className="text-center mb-10">
            <p className="text-electric-400 text-sm font-semibold tracking-widest uppercase mb-2">
              {t.about.teamEyebrow}
            </p>
            <h2 className="text-3xl font-bold text-white">{t.about.teamTitle}</h2>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {founders.map((founder) => (
              <StaggerItem key={founder.slug}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col rounded-2xl bg-navy-800/60 border border-navy-600/50 hover:border-electric-400/30 hover:shadow-glow overflow-hidden transition-all duration-300"
                >
                  {/* Banner */}
                  <div className="relative h-24 flex-shrink-0 bg-gradient-to-br from-slate-100 via-slate-200/80 to-slate-100 dark:from-navy-900 dark:via-navy-800/80 dark:to-navy-900">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_130%,rgba(126,217,182,0.12),transparent_60%)]" />
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(126,217,182,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(126,217,182,0.07) 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                      }}
                    />
                  </div>

                  {/* Avatar overlapping banner */}
                  <div className="relative flex justify-center -mt-[72px] mb-2 z-10">
                    <FounderAvatar name={founder.name} avatar={founder.avatar} />
                  </div>

                  <div className="px-6 pb-6 space-y-3">
                    <div>
                      <h3 className="text-white font-bold text-xl">{founder.name}</h3>
                      <p className="text-electric-400 text-sm font-medium">{founder.role}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <MapPin size={11} />
                      {founder.location}
                    </div>

                    <p className="text-slate-400 text-sm leading-relaxed">{founder.bio[locale]}</p>

                    <div className="flex items-center gap-3 pt-2">
                      {founder.github && (
                        <a
                          href={founder.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${founder.name} on GitHub`}
                          className="text-slate-500 hover:text-electric-400 transition-colors"
                        >
                          <Github size={16} />
                        </a>
                      )}
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${founder.name} on LinkedIn`}
                          className="text-slate-500 hover:text-electric-400 transition-colors"
                        >
                          <Linkedin size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
}
