'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Scroll to top"
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-white dark:bg-navy-700/90 border border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-600 shadow-md backdrop-blur-sm transition-colors flex items-center justify-center"
        >
          <ArrowUp size={16} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
