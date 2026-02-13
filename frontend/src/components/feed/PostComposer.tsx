import { useState, useRef } from 'react';
import { ImagePlus, X, Send } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { postsApi } from '../../lib/api';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import type { Post } from '../../types';

interface PostComposerProps {
  onPostCreated: (post: Post) => void;
}

export default function PostComposer({ onPostCreated }: PostComposerProps) {
  const { user } = useSession();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setExpanded(true);
  };

  const removeImage = () => {
    setImage(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('description', content);
      if (image) formData.append('image', image);
      const res = await postsApi.create(formData);
      onPostCreated(res.data);
      setContent('');
      removeImage();
      setExpanded(false);
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <Avatar src={user?.profileImage} fallback={(user?.firstName || 'U')[0]} size="md" />
        <div className="flex-1">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setExpanded(true)}
            className={`resize-none border-0 bg-transparent p-0 text-base placeholder:text-muted focus:ring-0 transition-all ${
              expanded ? 'min-h-[80px]' : 'min-h-[40px]'
            }`}
          />
        </div>
      </div>

      {preview && (
        <div className="relative mt-3 rounded-lg overflow-hidden">
          <img src={preview} alt="Preview" className="w-full max-h-64 object-cover rounded-lg" />
          <button
            onClick={removeImage}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {expanded && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border animate-fade-in">
          <div className="flex items-center gap-2">
            <input type="file" ref={fileRef} accept="image/*" onChange={handleImageSelect} className="hidden" />
            <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5 text-muted hover:text-primary">
              <ImagePlus className="h-4 w-4" />
              Photo
            </Button>
          </div>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading || (!content.trim() && !image)}
            className="gap-1.5"
          >
            {loading ? (
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Post
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
