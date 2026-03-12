'use client';

import { MessageCircle, Mail, Instagram, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/ui/AnimatedSection';
import { useClipboard } from '@/lib/hooks/useClipboard';
import { useTranslation } from '@/lib/i18n/context';
import { CONTACT } from '@/lib/constants';

interface CopyButtonProps {
  value: string;
  activeClass?: string;
}

function CopyButton({ value, activeClass = 'hover:text-electric-400 hover:bg-electric-400/10' }: CopyButtonProps) {
  const { copied, copy } = useClipboard();
  const { t } = useTranslation();

  return (
    <button
      onClick={() => copy(value)}
      aria-label={copied ? t.contact.copied : t.contact.copy}
      className={`flex items-center gap-1.5 text-xs transition-colors px-2 py-1 rounded-lg ${copied ? activeClass : `text-slate-500 ${activeClass}`}`}
    >
      {copied ? (
        <Check size={12} />
      ) : (
        <Copy size={12} />
      )}
      <span>{copied ? t.contact.copied : t.contact.copy}</span>
    </button>
  );
}

export function Contact() {
  const { t, locale } = useTranslation();

  return (
    <section id="contact" aria-label="Contact Oriental Labs" className="relative py-24 sm:py-32 bg-navy-950">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-electric-400/30 to-transparent" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-radial from-electric-500/8 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center space-y-5 mb-14">
          <p className="text-electric-400 text-sm font-semibold tracking-widest uppercase">
            {t.contact.eyebrow}
          </p>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            {t.contact.title}
          </h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
            {t.contact.description}
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {/* WhatsApp */}
          <StaggerItem>
            <motion.a
              href={`${CONTACT.whatsappUrl}?text=Hi! I found Oriental Labs and would like to talk about a project.`}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-start gap-3 p-6 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/25 hover:border-[#25D366]/50 hover:bg-[#25D366]/15 transition-colors group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#25D366]/15 border border-[#25D366]/25 flex items-center justify-center group-hover:bg-[#25D366]/25 transition-colors">
                <MessageCircle size={20} className="text-[#25D366]" />
              </div>
              <div>
                <p className="text-white font-semibold mb-0.5">WhatsApp</p>
                <p className="text-slate-400 text-sm">{CONTACT.whatsappDisplay}</p>
              </div>
              <div onClick={(e) => e.preventDefault()}>
                <CopyButton value={CONTACT.whatsappDisplay} activeClass="hover:text-[#25D366] hover:bg-[#25D366]/10 text-[#25D366]" />
              </div>
            </motion.a>
          </StaggerItem>

          {/* Email */}
          <StaggerItem>
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-start gap-3 p-6 rounded-2xl bg-electric-400/8 border border-electric-400/25 hover:border-electric-400/50 hover:bg-electric-400/12 transition-colors group"
            >
              <Link href={`/${locale}/formulario`} className="flex flex-col gap-3 w-full">
                <div className="w-11 h-11 rounded-xl bg-electric-400/12 border border-electric-400/25 flex items-center justify-center group-hover:bg-electric-400/20 transition-colors">
                  <Mail size={20} className="text-electric-400" />
                </div>
                <div>
                  <p className="text-white font-semibold mb-0.5">Email</p>
                  <p className="text-slate-400 text-sm break-all">{CONTACT.email}</p>
                </div>
              </Link>
              <div onClick={(e) => e.stopPropagation()}>
                <CopyButton value={CONTACT.email} activeClass="hover:text-electric-400 hover:bg-electric-400/10 text-electric-400" />
              </div>
            </motion.div>
          </StaggerItem>

          {/* Instagram */}
          <StaggerItem>
            <motion.a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-start gap-3 p-6 rounded-2xl bg-pink-500/8 border border-pink-500/20 hover:border-pink-500/40 hover:bg-pink-500/12 transition-colors group"
            >
              <div className="w-11 h-11 rounded-xl bg-pink-500/12 border border-pink-500/20 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                <Instagram size={20} className="text-pink-400" />
              </div>
              <div>
                <p className="text-white font-semibold mb-0.5">Instagram</p>
                <p className="text-slate-400 text-sm">@{CONTACT.instagramHandle}</p>
              </div>
              <div onClick={(e) => e.preventDefault()}>
                <CopyButton value={`@${CONTACT.instagramHandle}`} activeClass="hover:text-pink-400 hover:bg-pink-400/10 text-pink-400" />
              </div>
            </motion.a>
          </StaggerItem>
        </StaggerContainer>

        <AnimatedSection className="text-center">
          <p className="text-slate-600 text-sm">
            {t.contact.notice}{' '}
            <span className="text-slate-500">{t.contact.noSpam}</span>
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
}
