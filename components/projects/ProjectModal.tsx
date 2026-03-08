'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink, Github, Calendar, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n/context';
import { pickI18n } from '@/lib/i18n-content';
import type { DbProject } from '@/types/project';

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="#0b1e38"/></svg>'
);

interface ProjectModalProps {
  project: DbProject | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { t, locale } = useTranslation();
  const title = project ? (pickI18n(project.title_i18n, locale) || project.title || project.slug) : '';
  const shortDesc = project ? (pickI18n(project.short_description_i18n, locale) || project.short_description || '') : '';

  const handleKeyDown = useCallback((e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }, [onClose]);

  useEffect(() => {
    if (project) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [project, handleKeyDown]);

  return (
    <AnimatePresence>
      {project && (
        <>
          <motion.div key="backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-sm"
            onClick={onClose} aria-hidden="true" />

          <motion.div key="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto pointer-events-auto rounded-2xl bg-navy-800 border border-navy-600/60 shadow-2xl">
              <button onClick={onClose} aria-label="Close modal"
                className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-lg bg-navy-700/80 text-slate-400 hover:text-white hover:bg-navy-600/80 transition-colors">
                <X size={18} />
              </button>

              <div className="relative aspect-[16/8] w-full overflow-hidden rounded-t-2xl bg-navy-900">
                <Image
                  src={project.cover_image_url || PLACEHOLDER}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                  unoptimized={!project.cover_image_url}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-800/60 to-transparent" />
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h2 id="modal-title" className="text-2xl font-bold text-white leading-tight mb-2">
                    {title}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
                    {project.year && (
                      <span className="flex items-center gap-1.5"><Calendar size={13} />{project.year}</span>
                    )}
                    {project.role && <span className="text-slate-500">{project.role}</span>}
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed text-sm">{shortDesc}</p>

                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 text-xs rounded-lg bg-navy-700/80 text-slate-300 border border-navy-600/40">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2 flex-wrap">
                  <Link href={`/${locale}/projects/${project.slug}`} onClick={onClose}
                    className="flex items-center gap-1.5 text-sm text-electric-400 hover:text-electric-300 font-medium transition-colors">
                    View full project <ArrowRight size={14} />
                  </Link>
                  {project.live_url && (
                    <Button variant="primary" size="md" href={project.live_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={15} />
                      {t.projects.liveDemo}
                    </Button>
                  )}
                  {project.github_url && (
                    <Button variant="secondary" size="md" href={project.github_url} target="_blank" rel="noopener noreferrer">
                      <Github size={15} />
                      {t.projects.viewCode}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
