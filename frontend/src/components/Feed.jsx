import { useContext, useEffect } from "react";
import { authDataContext } from "../context/AuthContext";
import { userDataContext } from "../context/UserContext";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useInfinitePosts } from "../hooks/useInfinitePosts";
import Post from "../components/Post"
import { SkeletonFeed } from "../components/SkeletonFeed"
import toast from "react-hot-toast";
export default function Feed() {
  const { serverUrl } = useContext(authDataContext);
  const { userData } = useContext(userDataContext);

  const {
    posts,
    fetchPosts,
    loading,
    hasMore,
    error,
    setError,
  } = useInfinitePosts(serverUrl);



  useEffect(() => {
    console.log("useEffect called ,error->", error)
    const handleOnline = () => {
      console.log("Internet is back!");
      toast.success("Back online! Resuming feed...");
      // Agar pehle error aaya tha, toh usey reset karo 
      // Isse IntersectionObserver Sentinel ko dekh kar auto-fetch kar lega
      if (error) {
        setError(false);
      }
    };

    const handleOffline = () => {
      console.log("Internet is gone!");
      toast.error("You are offline. Please check your connection.", {
        icon: '🌐',
      });
      // Optionally yahan bhi error set kar sakte hain taaki sentinel hide ho jaye
      setError(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [error]);



  const sentinelRef = useInfiniteScroll(fetchPosts, hasMore, loading);

  // initial fetch ONCE after auth
  useEffect(() => {
    if (userData !== "loading" && Object.keys(userData).length) {
      fetchPosts();
    }
  }, [userData]); // ❗ intentionally NOT adding fetchPosts


  return (
    <div className="space-y-4">
      {posts.map(post => (
        <Post key={post._id} post={post} />
      ))}

      {/*Change: Sentinel tabhi dikhao jab error NA ho */}
      {!error && hasMore && (
        <div
          ref={sentinelRef}
          className="h-[10px]" // Thoda height dena better hota hai detection ke liye
        />
      )}

      {(loading || error) && <SkeletonFeed />}

      {error && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-500 italic">
            Having trouble connecting...
            <button onClick={() => setError(false)} className="ml-2 text-blue-500 underline">
              Retry
            </button>
          </p>
        </div>
      )}


    </div>
  );
}
