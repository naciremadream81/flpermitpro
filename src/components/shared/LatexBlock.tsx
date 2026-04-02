import { useRef, useEffect } from 'react';
import katex from 'katex';

interface LatexBlockProps { expression: string; displayMode?: boolean; className?: string; }

export function LatexBlock({ expression, displayMode = false, className = '' }: LatexBlockProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (ref.current) {
      katex.render(expression, ref.current, { displayMode, throwOnError: false });
    }
  }, [expression, displayMode]);
  return <span ref={ref} className={className} />;
}
