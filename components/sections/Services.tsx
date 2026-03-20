'use client';

import { Globe, Sparkles, Layers, Rocket, Zap, ArrowRight, Repeat, Plug } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StaggerContainer, StaggerItem, AnimatedSection } from '@/components/ui/AnimatedSection';
import { useTranslation } from '@/lib/i18n/context';
import { services, processSteps } from '@/lib/data/services';

const iconMap = { Globe, Sparkles, Layers, Rocket, Zap, Repeat, Plug } as const;
type IconName = keyof typeof iconMap;

export function Services() {
  const { locale, t } = useTranslation();

  return (
    <section id="services" aria-label="Services" className="relative py-24 sm:py-32 bg-navy-950">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-electric-400/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <SectionHeader
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          description={t.services.description}
        />

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => {
            const Icon = iconMap[service.icon as IconName] ?? Globe;
            return (
              <StaggerItem key={service.id}>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="group h-full flex flex-col p-6 rounded-2xl bg-navy-800/50 border border-navy-600/50 hover:border-electric-400/30 hover:shadow-glow transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-electric-400/10 border border-electric-400/20 flex items-center justify-center mb-5 group-hover:bg-electric-400/15 group-hover:border-electric-400/35 transition-colors">
                    <Icon size={20} className="text-electric-400" />
                  </div>

                  <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-electric-300 transition-colors">
                    {service.title[locale]}
                  </h3>

                  <p className="text-slate-400 text-sm leading-relaxed mb-4 flex-1">
                    {service.description[locale]}
                  </p>

                  <ul className="space-y-1.5">
                    {service.features[locale].map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="w-1 h-1 rounded-full bg-electric-400/60 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>

        {/* How we work */}
        <AnimatedSection className="mt-20">
          <div className="bg-navy-800/40 border border-navy-600/40 rounded-3xl p-8 sm:p-12">
            <div className="text-center mb-10">
              <p className="text-electric-400 text-sm font-semibold tracking-widest uppercase mb-2">
                {t.services.processEyebrow}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {t.services.processTitle}
              </h2>
            </div>

            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {processSteps.map((step, idx) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="relative flex flex-col items-start"
                >
                  <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-navy-900 border-2 border-electric-400/40 mb-4">
                    <span className="text-electric-400 font-bold text-lg">
                      {String(step.step).padStart(2, '0')}
                    </span>
                  </div>

                  <h3 className="text-white font-semibold text-lg mb-1.5">
                    {step.title[locale]}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.description[locale]}
                  </p>

                  {idx < processSteps.length - 1 && (
                    <div className="hidden lg:flex items-center absolute top-8 -translate-y-1/2 left-16 -right-6 z-20">
                      <div className="flex-1 h-px bg-gradient-to-r from-electric-400/40 to-electric-400/20" />
                      <ArrowRight size={14} className="text-electric-400/50 flex-shrink-0" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
