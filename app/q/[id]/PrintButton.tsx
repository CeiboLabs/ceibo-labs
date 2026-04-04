'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400 rounded-lg px-3 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-navy-800"
    >
      <Printer size={14} />
      Descargar PDF
    </button>
  );
}
