'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function RouteProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const prevPath = useRef(pathname);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (hideRef.current) clearTimeout(hideRef.current);
    setVisible(true);
    setWidth(12);
    let w = 12;
    intervalRef.current = setInterval(() => {
      // Ease toward 85% but never reach it — simulates indeterminate progress
      const remaining = 85 - w;
      const step = Math.max(1, remaining * 0.12);
      w = Math.min(85, w + step);
      setWidth(w);
    }, 200);
  }

  function finish() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setWidth(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 320);
  }

  // Detect navigation start: intercept internal anchor clicks
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      // Skip external, hash-only, or special links
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('mailto') ||
        href.startsWith('tel') ||
        href.startsWith('#') ||
        anchor.getAttribute('target') === '_blank'
      ) return;
      start();
    };
    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, []);

  // Detect navigation end: pathname changed
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      finish();
    }
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="progressbar"
      aria-hidden="true"
      className="fixed top-16 left-0 right-0 z-50 h-[2px] pointer-events-none"
    >
      <div
        className="h-full bg-electric-400 dark:bg-electric-400 transition-[width] ease-out"
        style={{
          width: `${width}%`,
          transitionDuration: width === 100 ? '200ms' : '180ms',
          boxShadow: '0 0 8px 0 rgba(126, 217, 182, 0.6)',
        }}
      />
    </div>
  );
}
