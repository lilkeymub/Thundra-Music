import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, MoreHorizontal, Image as ImageIcon, 
  Video, Music, Send, Smile, Flag, Bookmark, UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ReportModal from './ReportModal';

interface Post {
  id: string;
  user_id: string;
  content: string | null;
  media_urls: string[] | null;
  post_type: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  username?: string;
  avatar_url?: string;
  isLiked?: boolean;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
}

export default function FeedSection() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState('');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Check if user has liked posts
      let likedPostIds: string[] = [];
      if (user) {
        const { data: reactions } = await supabase
          .from('post_reactions')
          .select('post_id')
          .eq('user_id', user.id);
        likedPostIds = reactions?.map(r => r.post_id) || [];
      }

      setPosts(data.map(p => ({
        ...p,
        username: profileMap.get(p.user_id)?.username || 'Anonymous',
        avatar_url: profileMap.get(p.user_id)?.avatar_url,
        isLiked: likedPostIds.includes(p.id)
      })));
    }
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.trim()) return;

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: newPost.trim(),
        post_type: 'text'
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to create post', variant: 'destructive' });
      return;
    }

    setPosts(prev => [{
      ...data,
      username: profile?.username || 'You',
      avatar_url: profile?.avatar_url,
      isLiked: false
    }, ...prev]);
    setNewPost('');
    toast({ title: 'Posted!', description: 'Your post is now live' });
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.isLiked) {
      await supabase.from('post_reactions').delete().eq('post_id', postId).eq('user_id', user.id);
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, isLiked: false, likes_count: p.likes_count - 1 } : p
      ));
    } else {
      await supabase.from('post_reactions').insert({ post_id: postId, user_id: user.id, reaction_type: 'like' });
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, isLiked: true, likes_count: p.likes_count + 1 } : p
      ));
    }
  };

  const handleComment = async (postId: string) => {
    if (!user || !newComment.trim()) return;

    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim()
      })
      .select()
      .single();

    if (error) return;

    setComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), {
        ...data,
        username: profile?.username || 'You',
        avatar_url: profile?.avatar_url
      }]
    }));

    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
    ));
    setNewComment('');
  };

  const loadComments = async (postId: string) => {
    if (comments[postId]) return;

    const { data } = await supabase
      .from('post_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (data) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      setComments(prev => ({
        ...prev,
        [postId]: data.map(c => ({
          ...c,
          username: profileMap.get(c.user_id)?.username || 'Anonymous',
          avatar_url: profileMap.get(c.user_id)?.avatar_url
        }))
      }));
    }
  };

  const handleReport = (type: string, id: string) => {
    setReportTarget({ type, id });
    setReportModalOpen(true);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-display font-bold">Feed</h2>

      {/* Create Post */}
      {user && (
        <div className="glass-card p-4 rounded-xl space-y-4">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback>{profile?.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <Textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 resize-none"
              rows={3}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button size="sm" variant="ghost"><ImageIcon className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost"><Video className="w-4 h-4" /></Button>
              <Button size="sm" variant="ghost"><Music className="w-4 h-4" /></Button>
            </div>
            <Button onClick={handleCreatePost} disabled={!newPost.trim()}>Post</Button>
          </div>
        </div>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No posts yet. Be the first to post!</p>
          </div>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-4 rounded-xl space-y-4"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarImage src={post.avatar_url || undefined} />
                    <AvatarFallback>{post.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.username}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(post.created_at)}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost"><MoreHorizontal className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Bookmark className="w-4 h-4 mr-2" /> Save</DropdownMenuItem>
                    <DropdownMenuItem><UserPlus className="w-4 h-4 mr-2" /> Follow</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleReport('post', post.id)} className="text-destructive">
                      <Flag className="w-4 h-4 mr-2" /> Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Post Content */}
              <p className="text-sm">{post.content}</p>

              {/* Media */}
              {post.media_urls && post.media_urls.length > 0 && (
                <div className="grid gap-2">
                  {post.media_urls.map((url, i) => (
                    <img key={i} src={url} alt="" className="rounded-lg max-h-96 w-full object-cover" />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 pt-2 border-t border-border">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 text-sm transition-colors ${post.isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                  {post.likes_count}
                </button>
                <button
                  onClick={() => {
                    setSelectedPost(selectedPost === post.id ? null : post.id);
                    if (selectedPost !== post.id) loadComments(post.id);
                  }}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="w-5 h-5" />
                  {post.comments_count}
                </button>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Share2 className="w-5 h-5" />
                  {post.shares_count}
                </button>
              </div>

              {/* Comments */}
              <AnimatePresence>
                {selectedPost === post.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {comments[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex gap-2 pl-4 border-l-2 border-border">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={comment.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">{comment.username?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs"><span className="font-medium">{comment.username}</span></p>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {user && (
                      <div className="flex gap-2 pt-2">
                        <Input
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                        />
                        <Button size="icon" onClick={() => handleComment(post.id)}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        contentType={(reportTarget?.type as 'post' | 'comment' | 'message' | 'track' | 'user' | 'artist' | 'moderator') || 'post'}
        contentId={reportTarget?.id || ''}
      />
    </div>
  );
}
