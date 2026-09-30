import { useEffect, useRef, useState } from 'react';

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Reports whether the element is on screen. With `once`, it latches true the
 * first time (for reveal-on-scroll); without it, it tracks visibility (for pausing loops).
 */
export function useInView<T extends Element>(options: { once?: boolean; margin?: string } = {}) {
  const { once = false, margin = '0px 0px -12% 0px' } = options;
  const ref = useRef<T>(null);
  // Without IntersectionObserver, show everything rather than hide it forever.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin: margin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [once, margin]);

  return [ref, inView] as const;
}
