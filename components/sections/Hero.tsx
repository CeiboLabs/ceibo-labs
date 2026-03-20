'use client';

import { motion } from 'framer-motion';
import { ArrowDown, MessageCircle, ChevronRight, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n/context';
import { CONTACT } from '@/lib/constants';

const floatVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.12, duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] },
  }),
};

interface Props {
  takingClients?: boolean;
}

export function Hero({ takingClients = true }: Props) {
  const { t, locale } = useTranslation();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      aria-label="Hero"
      className="relative min-h-screen flex items-center overflow-hidden bg-navy-950"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(126,217,182,0.12) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-electric-500/10 via-electric-400/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-gradient-radial from-electric-500/8 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-7 max-w-xl">
          <motion.div custom={0} variants={floatVariants} initial="initial" animate="animate">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
              takingClients
                ? 'border-electric-400/30 bg-electric-400/8 text-electric-300'
                : 'border-amber-400/30 bg-amber-400/8 text-amber-300'
            }`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${takingClients ? 'bg-electric-400' : 'bg-amber-400'}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${takingClients ? 'bg-electric-400' : 'bg-amber-400'}`} />
              </span>
              {takingClients ? t.hero.badge : t.hero.badgeClosed}
            </span>
          </motion.div>

          <div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
              <span className="text-white block">Ceibo</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 via-electric-500 to-electric-300 block">
                Labs
              </span>
            </h1>
          </div>

          <motion.p
            custom={2}
            variants={floatVariants}
            initial="initial"
            animate="animate"
            className="text-xl text-slate-300 leading-relaxed"
          >
            {t.hero.tagline1}
            <br className="hidden sm:block" />
            <span className="text-slate-400"> {t.hero.tagline2}</span>
          </motion.p>

          <motion.div
            custom={3}
            variants={floatVariants}
            initial="initial"
            animate="animate"
            className="flex flex-wrap gap-3"
          >
            <Button variant="primary" size="lg" onClick={() => scrollToSection('projects')}>
              {t.hero.ctaProjects}
              <ChevronRight size={16} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              href={`${CONTACT.whatsappUrl}?text=${encodeURIComponent(locale === 'es' ? '¡Hola! Vi su página y me gustaría saber más sobre sus servicios.' : 'Hi! I saw your website and would like to know more about your services.')}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} />
              {takingClients ? t.hero.ctaWhatsapp : t.hero.ctaWaiting}
            </Button>
          </motion.div>

          <motion.div custom={4} variants={floatVariants} initial="initial" animate="animate">
            <button
              onClick={() => scrollToSection('services')}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-electric-400 transition-colors"
            >
              <ArrowDown size={14} className="animate-bounce" />
              {t.hero.seeServices}
            </button>
          </motion.div>
        </div>

        {/* Floating code card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="hidden lg:block"
        >
          <div className="animate-float relative">
            <div className="relative rounded-2xl bg-navy-800/80 border border-navy-600/60 backdrop-blur-sm shadow-glow-md p-1 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-navy-700/50">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                <div className="flex-1 mx-4 text-xs text-center text-slate-500 font-mono">
                  ceibo-labs / build.ts
                </div>
                <Code2 size={14} className="text-slate-600" />
              </div>

              <div className="p-5 font-mono text-sm leading-relaxed">
                <div className="text-slate-600 mb-1">{t.hero.codeComment}</div>
                <div>
                  <span className="text-purple-400">const</span>{' '}
                  <span className="text-electric-300">build</span>{' '}
                  <span className="text-slate-400">=</span>{' '}
                  <span className="text-purple-400">async</span>{' '}
                  <span className="text-slate-300">{'() => {'}</span>
                </div>
                <div className="ml-4 space-y-1">
                  <div>
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-electric-300">idea</span>{' '}
                    <span className="text-slate-400">=</span>{' '}
                    <span className="text-purple-400">await</span>{' '}
                    <span className="text-electric-300">discover</span>
                    <span className="text-slate-300">();</span>
                  </div>
                  <div>
                    <span className="text-purple-400">const</span>{' '}
                    <span className="text-electric-300">product</span>{' '}
                    <span className="text-slate-400">=</span>{' '}
                    <span className="text-purple-400">await</span>{' '}
                    <span className="text-electric-300">ship</span>
                    <span className="text-slate-300">(idea);</span>
                  </div>
                  <div>
                    <span className="text-purple-400">await</span>{' '}
                    <span className="text-electric-300">iterate</span>
                    <span className="text-slate-300">(product);</span>
                  </div>
                  <div>
                    <span className="text-purple-400">await</span>{' '}
                    <span className="text-electric-300">launch</span>
                    <span className="text-slate-300">(product);</span>
                  </div>
                </div>
                <div className="text-slate-300">{'}'}</div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-slate-600">{'>'}</span>
                  <span className="text-electric-400">build</span>
                  <span className="text-slate-300">();</span>
                  <span className="inline-block w-2 h-4 bg-electric-400/70 animate-pulse ml-0.5" />
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.4 }}
              className="absolute -top-4 -right-4 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold backdrop-blur-sm"
            >
              {t.hero.codeDeployed}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.4 }}
              className="absolute -bottom-3 -left-4 px-3 py-1.5 rounded-full bg-electric-400/15 border border-electric-400/25 text-electric-300 text-xs font-semibold backdrop-blur-sm"
            >
              {t.hero.codeDelivery}
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy-950 to-transparent pointer-events-none" />
    </section>
  );
}
