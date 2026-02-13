import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  MessageCircle,
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Settings,
  X,
} from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { authApi, notificationsApi, messagesApi, usersApi } from '../../lib/api';
import type { Notification as NotificationType, User } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';

export default function NavBar() {
  const { user, clearSession } = useSession();
  const { theme, toggleTheme } = useTheme();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch counts
  useEffect(() => {
    if (!user) return;
    notificationsApi.getUnreadCount().then((r) => setUnreadNotifCount(r.data.count));
    messagesApi.getUnreadCount().then((r) => setUnreadMsgCount(r.data.count));
  }, [user, location.pathname]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    const handleNewNotification = (notification: NotificationType) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadNotifCount((prev) => prev + 1);
    };
    const handleNewMessage = () => {
      if (!location.pathname.startsWith('/messages')) {
        setUnreadMsgCount((prev) => prev + 1);
      }
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, location.pathname]);

  // Click outside handlers
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await authApi.logout();
    clearSession();
    navigate('/login');
  };

  const openNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      const res = await notificationsApi.getAll();
      setNotifications(res.data);
      await notificationsApi.markAllRead();
      setUnreadNotifCount(0);
    }
  };

  const handleSearch = useCallback(async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    const res = await usersApi.search(q);
    setSearchResults(res.data);
  }, []);

  const navLinks = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/network', icon: Users, label: 'Network' },
    { to: '/messages', icon: MessageCircle, label: 'Messages', badge: unreadMsgCount },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  function getNotificationText(n: NotificationType) {
    const name = `${n.sender?.firstName || ''} ${n.sender?.lastName || ''}`.trim();
    switch (n.type) {
      case 'like': return `${name} liked your post`;
      case 'comment': return `${name} commented: "${n.preview}"`;
      case 'connection_request': return `${name} sent you a connection request`;
      case 'connection_accepted': return `${name} accepted your connection`;
      case 'message': return `${name}: ${n.preview}`;
      default: return `${name} interacted with you`;
    }
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-emerald-500 text-white font-bold text-lg shadow-sm">
            V
          </div>
          <span className="hidden sm:block text-xl font-bold tracking-tight bg-linear-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            Vibe
          </span>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearch(true)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-accent border-0 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted" />
              </button>
            )}
          </div>
          {showSearch && searchResults.length > 0 && (
            <div className="absolute top-full mt-2 w-full rounded-xl border border-border bg-card shadow-xl py-2 animate-scale-in max-h-80 overflow-y-auto">
              {searchResults.map((u) => (
                <button
                  key={u._id}
                  onClick={() => {
                    navigate(`/profile/${u._id}`);
                    setShowSearch(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-accent transition-colors text-left"
                >
                  <Avatar src={u.profileImage} fallback={(u.firstName || 'U')[0]} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-muted truncate">{u.headline || u.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, icon: Icon, label, badge }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                isActive(to)
                  ? 'text-primary'
                  : 'text-muted hover:text-foreground hover:bg-accent',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden sm:block">{label}</span>
              {!!badge && badge > 0 && (
                <span className="absolute -top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white px-1">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              {isActive(to) && (
                <span className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={openNotifications}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                showNotifications ? 'text-primary' : 'text-muted hover:text-foreground hover:bg-accent',
              )}
            >
              <Bell className="h-5 w-5" />
              <span className="hidden sm:block">Alerts</span>
              {unreadNotifCount > 0 && (
                <span className="absolute -top-0.5 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                  {unreadNotifCount > 99 ? '99+' : unreadNotifCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-xl animate-scale-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-muted text-sm">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors cursor-pointer border-b border-border last:border-0',
                          !n.read && 'bg-primary/5',
                        )}
                        onClick={() => {
                          setShowNotifications(false);
                          if (n.type === 'message' && n.conversation) navigate(`/messages/${n.conversation}`);
                          else if (n.type === 'connection_request' || n.type === 'connection_accepted') navigate('/network');
                          else navigate('/');
                        }}
                      >
                        <Avatar src={n.sender?.profileImage} fallback={(n.sender?.firstName || '?')[0]} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug">{getNotificationText(n)}</p>
                          <p className="text-xs text-muted mt-0.5">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        {!n.read && <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={toggleTheme} className="h-9 w-9 p-0 rounded-lg">
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-accent transition-colors">
                <Avatar src={user?.profileImage} fallback={(user?.firstName || 'U')[0]} size="sm" />
                <span className="hidden sm:block text-sm font-medium max-w-20 truncate">
                  {user?.firstName}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-2">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-muted truncate">{user?.headline || user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserIcon className="h-4 w-4 mr-2" /> My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/messages')}>
                <MessageCircle className="h-4 w-4 mr-2" /> Messages
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
