'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github, Mail, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n/context';
import { pickI18n } from '@/lib/i18n-content';
import { CONTACT } from '@/lib/constants';
import type { DbProject } from '@/types/project';

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#0b1e38"/></svg>'
);

interface Props {
  project: DbProject;
  allProjects: DbProject[];
  isPreview?: boolean;
}

export function ProjectPageContent({ project, allProjects, isPreview }: Props) {
  const { t, locale } = useTranslation();

  const title = pickI18n(project.title_i18n, locale) || project.title || project.slug;
  const shortDesc = pickI18n(project.short_description_i18n, locale) || project.short_description || '';
  const longDesc = pickI18n(project.long_description_i18n, locale) || project.long_description || '';
  const highlights = (project.highlights_i18n as Record<string, string[]> | null)?.[locale]
    || (project.highlights_i18n as Record<string, string[]> | null)?.es
    || project.highlights
    || [];

  const sorted = [...allProjects].sort((a, b) => a.sort_order - b.sort_order);
  const idx = sorted.findIndex((p) => p.slug === project.slug);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  const contactSubject = encodeURIComponent(`Consulta sobre el proyecto "${title}"`);
  const contactBody = encodeURIComponent(`Hola, quería consultar sobre el proyecto "${title}".`);

  return (
    <main className="min-h-screen bg-gradient-to-b from-navy-950 via-navy-900/30 to-navy-950 pt-24 pb-20">
      {isPreview && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-amber-500/90 text-navy-950 text-center text-sm font-semibold py-2 backdrop-blur-sm">
          Preview mode — this project is not published yet
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="flex items-center gap-1 hover:text-electric-400 transition-colors">
            <Home size={13} />
            Home
          </Link>
          <span>/</span>
          <Link href="/#projects" className="hover:text-electric-400 transition-colors">
            {t.nav.projects}
          </Link>
          <span>/</span>
          <span className="text-slate-300">{title}</span>
        </nav>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            {title}
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed mb-6">{shortDesc}</p>

          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {project.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 text-sm rounded-full bg-navy-800/80 text-electric-300 border border-electric-400/20">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Cover image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-navy-900 mb-12 shadow-2xl"
        >
          <Image
            src={project.cover_image_url || PLACEHOLDER}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 896px"
            unoptimized={!project.cover_image_url}
            priority
          />
        </motion.div>

        <div className="space-y-12">
          {/* Overview */}
          {longDesc && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Overview</h2>
              <div className="text-slate-300 leading-relaxed whitespace-pre-line">{longDesc}</div>
            </section>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Highlights</h2>
              <ul className="space-y-2">
                {highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300">
                    <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-electric-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Meta */}
          {(project.role || project.year) && (
            <section className="flex flex-wrap gap-8">
              {project.role && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Role</p>
                  <p className="text-slate-200 font-medium">{project.role}</p>
                </div>
              )}
              {project.year && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Year</p>
                  <p className="text-slate-200 font-medium">{project.year}</p>
                </div>
              )}
            </section>
          )}

          {/* Gallery */}
          {project.gallery.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">Gallery</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.gallery.slice(0, 4).map((item, i) => (
                  <div key={i} className="relative aspect-[16/9] rounded-xl overflow-hidden bg-navy-900">
                    <Image
                      src={item.src}
                      alt={item.alt || `${title} screenshot ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 432px"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="flex flex-wrap items-center gap-3 pt-4 border-t border-navy-700/50">
            {project.live_url && (
              <Button variant="primary" size="md" href={project.live_url}>
                <ExternalLink size={15} />
                {t.projects.liveDemo}
              </Button>
            )}
            {project.github_url && (
              <Button variant="secondary" size="md" href={project.github_url}>
                <Github size={15} />
                {t.projects.viewCode}
              </Button>
            )}
            <Button variant="ghost" size="md" href={`mailto:${CONTACT.email}?subject=${contactSubject}&body=${contactBody}`}>
              <Mail size={15} />
              {t.projects.contactAboutThis}
            </Button>
          </section>

          {/* Prev / Next */}
          {(prev || next) && (
            <nav aria-label="Project navigation" className="flex items-center justify-between gap-4 pt-4">
              {prev ? (
                <Link
                  href={`/projects/${prev.slug}`}
                  className="group flex items-center gap-2 text-sm text-slate-400 hover:text-electric-400 transition-colors"
                >
                  <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">Previous</p>
                    <p className="font-medium">{(prev.title_i18n as Record<string,string> | null)?.[locale] || prev.title || prev.slug}</p>
                  </div>
                </Link>
              ) : <span />}
              {next ? (
                <Link
                  href={`/projects/${next.slug}`}
                  className="group flex items-center gap-2 text-sm text-slate-400 hover:text-electric-400 transition-colors text-right"
                >
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-0.5">Next</p>
                    <p className="font-medium">{(next.title_i18n as Record<string,string> | null)?.[locale] || next.title || next.slug}</p>
                  </div>
                  <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ) : <span />}
            </nav>
          )}
        </div>
      </div>
    </main>
  );
}
