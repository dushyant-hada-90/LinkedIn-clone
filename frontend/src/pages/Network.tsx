import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Users, Check, X, Search } from 'lucide-react';
import { connectionsApi, usersApi } from '../lib/api';
import { useSession } from '../context/SessionContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import type { User, ConnectionRequest } from '../types';

export default function NetworkPage() {
  const { user: me } = useSession();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [connections, setConnections] = useState<User[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [loadingConns, setLoadingConns] = useState(true);
  const [actionBusy, setActionBusy] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    connectionsApi
      .pendingRequests()
      .then((res) => setRequests(res.data))
      .catch(() => {})
      .finally(() => setLoadingReqs(false));

    connectionsApi
      .myConnections()
      .then((res) => setConnections(res.data))
      .catch(() => {})
      .finally(() => setLoadingConns(false));
  }, []);

  useEffect(() => {
    if (search.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await usersApi.search(search);
        setSearchResults(res.data.filter((u) => u._id !== me?._id));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [search, me?._id]);

  const handleAction = async (id: string, action: 'accept' | 'reject') => {
    setActionBusy((prev) => ({ ...prev, [id]: true }));
    try {
      if (action === 'accept') {
        await connectionsApi.accept(id);
        // Move sender from requests to connections
        const req = requests.find((r) => r._id === id);
        if (req) setConnections((prev) => [...prev, req.sender as unknown as User]);
      } else {
        await connectionsApi.reject(id);
      }
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch {
      // ignore
    } finally {
      setActionBusy((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleRemove = async (userId: string) => {
    setActionBusy((prev) => ({ ...prev, [userId]: true }));
    try {
      await connectionsApi.remove(userId);
      setConnections((prev) => prev.filter((c) => c._id !== userId));
    } catch {
      // ignore
    } finally {
      setActionBusy((prev) => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Network</h1>
          <p className="text-sm text-muted">Manage your connections and discover new people</p>
        </div>

        {/* Search people */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for people…"
                className="pl-9"
              />
            </div>
            {search.length >= 2 && (
              <div className="mt-3 space-y-2">
                {searching ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                    ))}
                  </div>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-muted py-2">No users found.</p>
                ) : (
                  searchResults.map((u) => (
                    <button
                      key={u._id}
                      onClick={() => navigate(`/profile/${u._id}`)}
                      className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <Avatar src={u.profileImage} fallback={(u.firstName || '?')[0]} size="sm" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-xs text-muted truncate">{u.headline || ''}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="requests">
          <TabsList>
            <TabsTrigger value="requests">
              Invitations
              {requests.length > 0 && (
                <Badge variant="default" className="ml-1.5 text-[10px] px-1.5 py-0">{requests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="connections">
              Connections
              <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">{connections.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Pending Requests */}
          <TabsContent value="requests" className="mt-4 space-y-3">
            {loadingReqs ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-20 rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-10 text-center">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <UserPlus className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-semibold">No pending invitations</p>
                  <p className="text-sm text-muted mt-1">Search for people to grow your network</p>
                </CardContent>
              </Card>
            ) : (
              requests.map((req) => (
                <Card key={req._id} className="animate-fade-in">
                  <CardContent className="flex items-center gap-3 p-4">
                    <button onClick={() => navigate(`/profile/${req.sender._id}`)}>
                      <Avatar src={req.sender.profileImage} fallback={(req.sender.firstName || '?')[0]} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => navigate(`/profile/${req.sender._id}`)}
                        className="text-sm font-semibold hover:underline truncate"
                      >
                        {req.sender.firstName} {req.sender.lastName}
                      </button>
                      <p className="text-xs text-muted truncate">{req.sender.headline || 'Vibe member'}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleAction(req._id, 'accept')}
                        disabled={actionBusy[req._id]}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(req._id, 'reject')}
                        disabled={actionBusy[req._id]}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* My Connections */}
          <TabsContent value="connections" className="mt-4">
            {loadingConns ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardContent className="flex flex-col items-center p-5 space-y-2">
                      <Skeleton className="h-14 w-14 rounded-full" />
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : connections.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center py-10 text-center">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <p className="font-semibold">No connections yet</p>
                  <p className="text-sm text-muted mt-1">Send connection requests to start networking</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((c: any) => (
                  <Card key={c._id} className="group overflow-hidden animate-fade-in">
                    {/* Colored top strip */}
                    <div className="h-1.5 bg-linear-to-r from-teal-400 to-emerald-400" />
                    <CardContent className="flex flex-col items-center p-5 text-center">
                      <button onClick={() => navigate(`/profile/${c._id}`)}>
                        <Avatar src={c.profileImage} fallback={(c.firstName || '?')[0]} size="lg" />
                      </button>
                      <button
                        onClick={() => navigate(`/profile/${c._id}`)}
                        className="mt-2 font-semibold text-sm hover:underline"
                      >
                        {c.firstName} {c.lastName}
                      </button>
                      <p className="text-xs text-muted mt-0.5 truncate max-w-full">{c.headline || 'Vibe member'}</p>
                      <div className="mt-3 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/messages`)}
                        >
                          Message
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemove(c._id)}
                          disabled={actionBusy[c._id]}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
