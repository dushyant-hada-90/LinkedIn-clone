import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Trash2,
  UserPlus,
  UserMinus,
  Clock,
  CheckCheck,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from '../../context/SessionContext';
import { postsApi, connectionsApi } from '../../lib/api';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import CommentSection from './CommentSection';
import type { Post, ConnectionStatus } from '../../types';
import { cn } from '../../lib/utils';

interface PostCardProps {
  post: Post;
  onUpdate: (post: Post) => void;
  onDelete: (postId: string) => void;
}

export default function PostCard({ post, onUpdate, onDelete }: PostCardProps) {
  const { user } = useSession();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    post.connectionStatus || 'connect',
  );
  const [likeLoading, setLikeLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  const isOwner = user?._id === post.author?._id;
  const isLiked = post.likes?.includes(user?._id || '');
  const author = post.author;

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await postsApi.toggleLike(post._id);
      onUpdate(res.data);
    } catch (err) {
      console.error('Like failed', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await postsApi.delete(post._id);
      onDelete(post._id);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleConnect = async () => {
    if (connectLoading) return;
    setConnectLoading(true);
    try {
      if (connectionStatus === 'connect') {
        await connectionsApi.send(author._id);
        setConnectionStatus('pending');
      } else if (connectionStatus === 'disconnect') {
        await connectionsApi.remove(author._id);
        setConnectionStatus('connect');
      }
    } catch (err) {
      console.error('Connection action failed', err);
    } finally {
      setConnectLoading(false);
    }
  };

  const getConnectionButton = () => {
    if (isOwner || connectionStatus === 'self') return null;

    const configs: Record<string, { icon: typeof UserPlus; label: string; variant: 'ghost' | 'outline' }> = {
      connect: { icon: UserPlus, label: 'Connect', variant: 'outline' },
      pending: { icon: Clock, label: 'Pending', variant: 'ghost' },
      disconnect: { icon: UserMinus, label: 'Connected', variant: 'ghost' },
      accept: { icon: CheckCheck, label: 'Accept', variant: 'outline' },
    };

    const config = configs[connectionStatus];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Button
        variant={config.variant}
        size="sm"
        className="gap-1.5 text-xs"
        onClick={handleConnect}
        disabled={connectLoading || connectionStatus === 'pending'}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.label}
      </Button>
    );
  };

  return (
    <article className="rounded-xl border border-border bg-card shadow-sm animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/profile/${author._id}`)}>
            <Avatar src={author.profileImage} fallback={(author.firstName || 'U')[0]} size="md" />
          </button>
          <div className="min-w-0">
            <button
              onClick={() => navigate(`/profile/${author._id}`)}
              className="font-semibold text-sm hover:underline truncate block"
            >
              {author.firstName} {author.lastName}
            </button>
            <p className="text-xs text-muted truncate">{author.headline || 'Vibe user'}</p>
            <p className="text-xs text-muted">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getConnectionButton()}
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete post
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.description}</p>
      </div>

      {/* Image */}
      {post.image && (
        <div className="border-t border-b border-border">
          <img
            src={post.image}
            alt="Post"
            className="w-full max-h-[500px] object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Stats */}
      {(post.likes?.length > 0 || post.comments?.length > 0) && (
        <div className="flex items-center justify-between px-4 py-2 text-xs text-muted">
          <span className="flex items-center gap-1">
            {post.likes?.length > 0 && (
              <>
                <span className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
                  <Heart className="h-2.5 w-2.5 text-primary fill-primary" />
                </span>
                {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
              </>
            )}
          </span>
          {post.comments?.length > 0 && (
            <button onClick={() => setShowComments(!showComments)} className="hover:underline">
              {post.comments.length} {post.comments.length === 1 ? 'comment' : 'comments'}
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center border-t border-border px-2 py-1">
        <button
          onClick={handleLike}
          className={cn(
            'flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-accent',
            isLiked ? 'text-primary' : 'text-muted hover:text-foreground',
          )}
        >
          <Heart className={cn('h-4 w-4 transition-all', isLiked && 'fill-primary scale-110')} />
          Like
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 flex-1 justify-center py-2.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-accent transition-all"
        >
          <MessageCircle className="h-4 w-4" />
          Comment
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t border-border animate-fade-in">
          <CommentSection post={post} onUpdate={onUpdate} />
        </div>
      )}
    </article>
  );
}
