import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MoreHorizontal, Trash2, Pencil, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useSession } from '../../context/SessionContext';
import { postsApi } from '../../lib/api';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { Post, Comment } from '../../types';

interface CommentSectionProps {
  post: Post;
  onUpdate: (post: Post) => void;
}

export default function CommentSection({ post, onUpdate }: CommentSectionProps) {
  const { user } = useSession();
  const navigate = useNavigate();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddComment = async () => {
    if (!comment.trim() || loading) return;
    setLoading(true);
    try {
      const res = await postsApi.addComment(post._id, comment);
      onUpdate(res.data);
      setComment('');
    } catch (err) {
      console.error('Comment failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const res = await postsApi.deleteComment(post._id, commentId);
      onUpdate(res.data);
    } catch (err) {
      console.error('Delete comment failed', err);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await postsApi.editComment(post._id, commentId, editContent);
      onUpdate(res.data);
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Edit comment failed', err);
    }
  };

  const startEdit = (c: Comment) => {
    setEditingId(c._id);
    setEditContent(c.content);
  };

  return (
    <div className="p-4 space-y-3">
      {/* Comment input */}
      <div className="flex items-center gap-2">
        <Avatar src={user?.profileImage} fallback={(user?.firstName || 'U')[0]} size="sm" />
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Write a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            className="text-sm"
          />
          <Button
            size="sm"
            onClick={handleAddComment}
            disabled={!comment.trim() || loading}
            className="shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {post.comments?.map((c) => (
          <div key={c._id} className="flex gap-2 group">
            <button onClick={() => navigate(`/profile/${c.user?._id}`)}>
              <Avatar src={c.user?.profileImage} fallback={(c.user?.firstName || '?')[0]} size="sm" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="bg-accent rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/profile/${c.user?._id}`)}
                    className="text-xs font-semibold hover:underline"
                  >
                    {c.user?.firstName} {c.user?.lastName}
                  </button>
                  {c.isEdited && <span className="text-[10px] text-muted">(edited)</span>}
                </div>
                {editingId === c._id ? (
                  <div className="flex items-center gap-1 mt-1">
                    <Input
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="text-xs h-7"
                      onKeyDown={(e) => e.key === 'Enter' && handleEditComment(c._id)}
                    />
                    <Button size="sm" className="h-7 w-7 p-0" onClick={() => handleEditComment(c._id)}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setEditingId(null)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm mt-0.5">{c.content}</p>
                )}
              </div>
              <span className="text-[10px] text-muted ml-3">
                {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
              </span>
            </div>

            {user?._id === c.user?._id && editingId !== c._id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                    <MoreHorizontal className="h-4 w-4 text-muted" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => startEdit(c)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteComment(c._id)} className="text-red-500">
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
