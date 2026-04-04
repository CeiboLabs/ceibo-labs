'use client';

import { useEffect, useRef, useState } from 'react';

const DOC_WIDTH = 794; // ~210mm at 96dpi

export function QuoteScaler({ children }: { children: React.ReactNode }) {
  const [scale, setScale]   = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const available = window.innerWidth - 32; // 16px padding each side
      const newScale  = Math.min(1, available / DOC_WIDTH);
      setScale(newScale);
      if (innerRef.current) {
        setHeight(Math.ceil(innerRef.current.offsetHeight * newScale));
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div style={{ height: height ?? 'auto' }}>
      <div
        ref={innerRef}
        style={{
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
          width: DOC_WIDTH,
        }}
      >
        {children}
      </div>
    </div>
  );
}
