'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/context';

export type FilterOption = string; // 'All' or any tag

interface ProjectFiltersProps {
  filters: string[];       // available tag values (computed from loaded projects)
  active: FilterOption;
  onChange: (filter: FilterOption) => void;
}

export function ProjectFilters({ filters, active, onChange }: ProjectFiltersProps) {
  const { t } = useTranslation();
  const all = ['All', ...filters];

  return (
    <div role="tablist" aria-label="Filter projects by tag" className="flex flex-wrap justify-center gap-2">
      {all.map((filter) => (
        <button
          key={filter}
          role="tab"
          aria-selected={active === filter}
          onClick={() => onChange(filter)}
          className={cn(
            'relative px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 focus-visible:ring-offset-2',
            active === filter
              ? 'text-navy-950'
              : 'text-slate-400 hover:text-white bg-navy-800/60 border border-navy-600/50 hover:border-electric-400/30'
          )}
        >
          {active === filter && (
            <motion.span
              layoutId="filter-pill"
              className="absolute inset-0 rounded-full bg-gradient-to-r from-electric-400 to-electric-500"
              style={{ zIndex: -1 }}
              transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
            />
          )}
          {filter === 'All' ? t.projects.all : filter}
        </button>
      ))}
    </div>
  );
}
