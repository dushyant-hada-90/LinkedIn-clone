import { useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll(callback: () => void, enabled: boolean) {
  const observer = useRef<IntersectionObserver | null>(null);

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      if (observer.current) observer.current.disconnect();
      if (!enabled || !node) return;

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            callback();
          }
        },
        { threshold: 0.1 },
      );

      observer.current.observe(node);
    },
    [callback, enabled],
  );

  useEffect(() => {
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, []);

  return sentinelRef;
}
