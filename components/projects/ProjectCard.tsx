'use client';

import Image from 'next/image';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/context';
import { pickI18n } from '@/lib/i18n-content';
import type { DbProject } from '@/types/project';
import { cn } from '@/lib/utils';

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450"><rect width="800" height="450" fill="#0b1e38"/><text x="400" y="225" font-family="system-ui" font-size="18" fill="#1a3350" text-anchor="middle" dominant-baseline="middle">No image</text></svg>'
);

interface ProjectCardProps {
  project: DbProject;
  onClick: (project: DbProject) => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { t, locale } = useTranslation();
  const imageSrc = project.cover_image_url || PLACEHOLDER;
  const title = pickI18n(project.title_i18n, locale) || project.title || project.slug;
  const shortDesc = pickI18n(project.short_description_i18n, locale) || project.short_description || '';

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden cursor-pointer',
        'bg-navy-800/60 border border-navy-600/50',
        'hover:border-electric-400/30 hover:shadow-glow',
        'transition-colors duration-300'
      )}
      onClick={() => onClick(project)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(project)}
      aria-label={`View details for ${title}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-navy-900">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized={!project.cover_image_url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex items-center gap-1.5 text-white text-sm font-medium">
            <span>{t.projects.viewDetails}</span>
            <ArrowRight size={14} />
          </div>
        </div>
        {project.featured && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-electric-400/20 text-electric-300 border border-electric-400/30 backdrop-blur-sm">
              {t.projects.featured}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <h3 className="text-white font-semibold text-lg leading-snug group-hover:text-electric-300 transition-colors">
          {title}
        </h3>

        <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 flex-1">
          {shortDesc}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-1">
          {project.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-xs rounded-md bg-navy-700/80 text-slate-400 border border-navy-600/40">
              {tag}
            </span>
          ))}
          {project.tags.length > 4 && (
            <span className="px-2 py-0.5 text-xs rounded-md bg-navy-700/80 text-slate-500 border border-navy-600/40">
              +{project.tags.length - 4}
            </span>
          )}
        </div>

        {(project.live_url || project.github_url) && (
          <div className="flex items-center gap-3 mt-1 pt-3 border-t border-navy-600/40" onClick={(e) => e.stopPropagation()}>
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 py-1.5 text-xs text-slate-400 hover:text-electric-400 transition-colors">
                <ExternalLink size={12} />
                {t.projects.liveDemo}
              </a>
            )}
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 py-1.5 text-xs text-slate-400 hover:text-electric-400 transition-colors">
                <Github size={12} />
                {t.projects.viewCode}
              </a>
            )}
          </div>
        )}
      </div>
    </motion.article>
  );
}
