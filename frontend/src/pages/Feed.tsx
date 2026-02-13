import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Users } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { postsApi, connectionsApi } from '../lib/api';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import PostComposer from '../components/feed/PostComposer';
import PostCard from '../components/feed/PostCard';
import { Avatar } from '../components/ui/avatar';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import type { Post, User } from '../types';

export default function FeedPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [connections, setConnections] = useState<User[]>([]);

  const fetchFeed = useCallback(async (append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const cursorParam = append && cursor ? cursor : undefined;
      const res = await postsApi.feed(cursorParam);
      const { posts: incoming, nextCursor } = res.data;
      setCursor(nextCursor ? JSON.stringify(nextCursor) : null);
      setPosts((prev) => (append ? [...prev, ...incoming] : incoming));
    } catch (err) {
      console.error('Feed fetch error', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor]);

  useEffect(() => {
    fetchFeed(false);
    connectionsApi.myConnections().then((r) => setConnections(r.data)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingMore && cursor) fetchFeed(true);
  }, [loadingMore, cursor, fetchFeed]);

  const sentinelRef = useInfiniteScroll(loadMore, !!cursor && !loadingMore);

  const handlePostCreated = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  const handlePostUpdate = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p._id === updated._id ? updated : p)));
  };

  const handlePostDelete = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block space-y-4">
            <Card className="overflow-hidden">
              {/* Cover gradient */}
              <div className="h-20 bg-linear-to-r from-teal-500 to-emerald-400 relative">
                <div className="absolute -bottom-8 left-4">
                  <Avatar src={user?.profileImage} fallback={(user?.firstName || 'U')[0]} size="lg" />
                </div>
              </div>
              <CardContent className="pt-10 pb-4 px-4">
                <button onClick={() => navigate('/profile')} className="font-semibold hover:underline">
                  {user?.firstName} {user?.lastName}
                </button>
                <p className="text-xs text-muted mt-0.5">{user?.headline || 'Welcome to Vibe'}</p>
                <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
                  <div>
                    <p className="font-semibold">{user?.postCount || 0}</p>
                    <p className="text-muted">Posts</p>
                  </div>
                  <div>
                    <p className="font-semibold">{connections.length}</p>
                    <p className="text-muted">Connections</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick links */}
            <Card>
              <CardContent className="p-3 space-y-1">
                <button
                  onClick={() => navigate('/network')}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                >
                  <Users className="h-4 w-4 text-primary" />
                  My Network
                </button>
                <button
                  onClick={() => navigate('/messages')}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-primary" />
                  Messages
                </button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Feed */}
          <div className="space-y-4 min-w-0">
            {/* Greeting */}
            <div className="flex items-center gap-3 mb-2">
              <div>
                <h1 className="text-2xl font-bold">{greeting}, {user?.firstName}!</h1>
                <p className="text-sm text-muted">Here's what's happening on Vibe</p>
              </div>
            </div>

            <PostComposer onPostCreated={handlePostCreated} />

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-48 w-full rounded-lg" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">No posts yet</h3>
                  <p className="text-sm text-muted max-w-xs">
                    Be the first to share something with the community!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onUpdate={handlePostUpdate}
                    onDelete={handlePostDelete}
                  />
                ))}

                {/* Infinite scroll sentinel */}
                <div ref={sentinelRef} className="h-4" />

                {loadingMore && (
                  <div className="flex justify-center py-4">
                    <span className="h-6 w-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Trending
                </h3>
                <div className="space-y-3">
                  {['Web Development', 'AI & Machine Learning', 'Open Source', 'Startups', 'Design'].map(
                    (topic, i) => (
                      <div key={topic} className="flex items-start gap-2">
                        <span className="text-xs text-muted font-mono">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{topic}</p>
                          <p className="text-xs text-muted">{Math.floor(Math.random() * 500 + 100)} posts</p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>

            {connections.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-sm mb-3">Your connections</h3>
                  <div className="space-y-2">
                    {connections.slice(0, 5).map((c: any) => (
                      <button
                        key={c._id}
                        onClick={() => navigate(`/profile/${c._id}`)}
                        className="flex items-center gap-2 w-full p-1.5 rounded-lg hover:bg-accent transition-colors"
                      >
                        <Avatar src={c.profileImage} fallback={(c.firstName || '?')[0]} size="sm" />
                        <div className="text-left min-w-0">
                          <p className="text-xs font-medium truncate">{c.firstName} {c.lastName}</p>
                          <p className="text-[10px] text-muted truncate">{c.headline || ''}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center text-xs text-muted py-4">
              <p>Vibe &copy; {new Date().getFullYear()}</p>
              <p className="mt-0.5">Built by Dushyant</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
