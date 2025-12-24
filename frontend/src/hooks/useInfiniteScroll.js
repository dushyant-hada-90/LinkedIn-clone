import { useEffect, useRef } from "react";

export function useInfiniteScroll(fetchPosts, hasMore, loading) {
  const sentinelRef = useRef();

  // Dependency array ko khali rakhne ke liye Refs ka use
  const loadingRef = useRef(loading);
  const hasMoreRef = useRef(hasMore);

  useEffect(() => { 
    loadingRef.current = loading; 
    hasMoreRef.current = hasMore;
}, [loading, hasMore]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Observer ab Ref se latest value utha lega bina re-create hue!
        if (entry.isIntersecting && hasMoreRef.current && !loadingRef.current) {
          console.log("intersected ->",entry.isIntersecting)
            fetchPosts();
        }
    }, { rootMargin: "200px" });
    

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [fetchPosts]); //ye sirf fetchPosts badalne par re-run hoga

  return sentinelRef;
}
