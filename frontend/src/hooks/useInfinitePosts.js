import axios from "axios";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
export function useInfinitePosts(serverUrl) {
    const [posts, setPosts] = useState([])
    const [cursor, setCursor] = useState(null)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)
    const [error,setError] = useState(false)
    // Internal Guard: Yeh render cycle se tez hai
    const isFetching = useRef(false);



    const fetchPosts = useCallback(
        async () => {
            // console.log(cursor, loading, hasMore)
            if (isFetching.current || !hasMore) return;

            isFetching.current = true;
            setLoading(true)
            try {
                const res = await axios.get(`${serverUrl}/api/post/getpost`, {
                    params: {
                        cursor: cursor ? JSON.stringify(cursor) : null, limit: 2,
                    },

                    withCredentials: true
                })
                console.log("posts ->", res.data.post);


                setPosts(prev => {
                    const map = new Map();
                    [...prev, ...res.data.post].forEach(p => map.set(p._id, p));
                    return Array.from(map.values());
                });

                setCursor(res.data.nextCursor);
                setHasMore(Boolean(res.data.nextCursor));
            } catch (err) {
                console.error("Fetch failed:", err);
                setError(true);
                toast.error("Failed to load more posts. Server might be down.",{ id: "api-error" });
            } finally {
                // Step 3: Unlock and Hide Spinner
                isFetching.current = false;
                setLoading(false);
            }
        },
        [serverUrl, cursor, hasMore, loading,error],
    )
    return { posts, fetchPosts, loading, hasMore,error,setError };
}
