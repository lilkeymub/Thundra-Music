import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, 
  Repeat, Shuffle, Heart, Share2, MessageCircle, ListMusic,
  ChevronDown, Music, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useTrackInteractions } from '@/hooks/useTrackInteractions';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
  cover?: string;
  duration?: string;
  lyrics?: string | null;
}

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  progress: number;
  onProgressChange: (value: number) => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  isMuted: boolean;
  onMuteToggle: () => void;
  isRepeat: boolean;
  onRepeatToggle: () => void;
  isShuffle: boolean;
  onShuffleToggle: () => void;
  queue: Track[];
  onPlayFromQueue: (track: Track) => void;
}

type View = 'cover' | 'lyrics' | 'queue' | 'comments';

export default function FullScreenPlayer({
  isOpen,
  onClose,
  track,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  progress,
  onProgressChange,
  volume,
  onVolumeChange,
  isMuted,
  onMuteToggle,
  isRepeat,
  onRepeatToggle,
  isShuffle,
  onShuffleToggle,
  queue,
  onPlayFromQueue
}: FullScreenPlayerProps) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const { hasRole } = useUserRole();
  const [activeView, setActiveView] = useState<View>('cover');
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [displayedCommentIndex, setDisplayedCommentIndex] = useState(0);
  
  const canDownload = hasRole('premium') || hasRole('vip') || hasRole('artist');

  const { comments, reactions, userReactions, addComment, toggleReaction, REACTION_TYPES } = 
    useTrackInteractions(track?.id || null);

  const coverUrl = track?.cover_url || track?.cover;

  // Cycle through comments for live display
  useEffect(() => {
    if (comments.length === 0) return;
    const interval = setInterval(() => {
      setDisplayedCommentIndex(prev => (prev + 1) % comments.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [comments.length]);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/track/${track?.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${track?.title} by ${track?.artist}`,
          text: `Listen to ${track?.title} on Thundra Music!`,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied!", description: "Share link copied to clipboard" });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLike = () => {
    if (!user) {
      openAuthModal({ mode: 'login', message: 'Sign in to like tracks' });
      return;
    }
    setLiked(!liked);
  };

  const handleDownload = () => {
    if (!user) {
      openAuthModal({ mode: 'login', message: 'Sign in to download tracks' });
      return;
    }
    if (!canDownload) {
      toast({
        title: 'Premium Feature',
        description: 'Upgrade to Premium or VIP to download tracks',
        variant: 'destructive',
      });
      return;
    }
    toast({ title: 'Downloading...', description: `${track?.title} will be downloaded` });
  };

  const handleReaction = async (reaction: string) => {
    if (!user) {
      openAuthModal({ mode: 'login', message: 'Sign in to react' });
      return;
    }
    await toggleReaction(reaction);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal({ mode: 'login', message: 'Sign in to comment' });
      return;
    }
    if (!newComment.trim()) return;

    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
      toast({ title: "Comment posted!" });
    }
  };

  if (!track) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background overflow-hidden"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url(${coverUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(60px)',
              }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          </div>
          
          <div className="relative h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6">
              <button onClick={onClose} className="p-2 hover:bg-accent rounded-full">
                <ChevronDown className="w-6 h-6" />
              </button>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Now Playing</p>
                <p className="text-sm font-medium">{track.artist}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-accent rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden px-4 sm:px-6">
              <AnimatePresence mode="wait">
                {activeView === 'cover' && (
                  <motion.div
                    key="cover"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="h-full flex flex-col items-center justify-center"
                  >
                    <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden shadow-2xl mb-6">
                      <img 
                        src={coverUrl} 
                        alt={track.title} 
                        className="w-full h-full object-cover"
                      />
                      {/* Live comment overlay */}
                      {comments.length > 0 && (
                        <motion.div
                          key={displayedCommentIndex}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="absolute bottom-4 left-4 right-4 glass p-3 rounded-lg"
                        >
                          <p className="text-xs text-primary font-medium">@{comments[displayedCommentIndex]?.username}</p>
                          <p className="text-sm truncate">{comments[displayedCommentIndex]?.content}</p>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Track Info */}
                    <div className="text-center mb-4">
                      <h2 className="text-2xl font-display font-bold mb-1">{track.title}</h2>
                      <p className="text-muted-foreground">{track.artist}</p>
                    </div>

                    {/* Reactions */}
                    <div className="flex gap-2 mb-4">
                      {reactions.map(({ reaction_type, count }) => (
                        <button
                          key={reaction_type}
                          onClick={() => handleReaction(reaction_type)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                            userReactions.includes(reaction_type)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          <span>{reaction_type}</span>
                          {count > 0 && <span className="text-xs">{count}</span>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeView === 'lyrics' && (
                  <motion.div
                    key="lyrics"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col items-center justify-center"
                  >
                    <ScrollArea className="h-[60vh] w-full max-w-lg">
                      {track.lyrics ? (
                        <div className="text-center space-y-4 py-8">
                          {track.lyrics.split('\n').map((line, i) => (
                            <p key={i} className="text-lg sm:text-xl font-medium">
                              {line || <br />}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <Music className="w-16 h-16 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No lyrics available</p>
                        </div>
                      )}
                    </ScrollArea>
                  </motion.div>
                )}

                {activeView === 'queue' && (
                  <motion.div
                    key="queue"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full"
                  >
                    <h3 className="text-lg font-bold mb-4">Queue</h3>
                    <ScrollArea className="h-[60vh]">
                      <div className="space-y-2">
                        {queue.map((queueTrack, i) => (
                          <div
                            key={queueTrack.id}
                            onClick={() => onPlayFromQueue(queueTrack)}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                              track.id === queueTrack.id ? 'bg-primary/20' : 'hover:bg-accent/50'
                            }`}
                          >
                            <span className="text-sm text-muted-foreground w-6">{i + 1}</span>
                            <img 
                              src={queueTrack.cover_url || queueTrack.cover} 
                              alt={queueTrack.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{queueTrack.title}</p>
                              <p className="text-sm text-muted-foreground truncate">{queueTrack.artist}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </motion.div>
                )}

                {activeView === 'comments' && (
                  <motion.div
                    key="comments"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full flex flex-col"
                  >
                    <h3 className="text-lg font-bold mb-4">Comments</h3>
                    <ScrollArea className="flex-1 mb-4">
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 p-3 bg-secondary/50 rounded-lg">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                              {comment.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-primary">@{comment.username}</p>
                              <p className="text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                        {comments.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">No comments yet. Be the first!</p>
                        )}
                      </div>
                    </ScrollArea>
                    <form onSubmit={handleSubmitComment} className="flex gap-2">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1"
                      />
                      <Button type="submit">Post</Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View Toggles */}
            <div className="flex justify-center gap-2 py-4">
              {(['cover', 'lyrics', 'queue', 'comments'] as View[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-4 py-2 rounded-full text-sm capitalize transition-colors ${
                    activeView === view
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {view}
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="px-4 sm:px-6">
              <Slider
                value={[progress]}
                max={100}
                step={0.1}
                onValueChange={([v]) => onProgressChange(v)}
                className="w-full"
              />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>{Math.floor(progress * 2.25 / 60)}:{String(Math.floor(progress * 2.25 % 60)).padStart(2, '0')}</span>
                <span>{track.duration || '0:00'}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <button onClick={handleLike} className="p-2">
                  <Heart className={`w-6 h-6 ${liked ? 'fill-primary text-primary' : ''}`} />
                </button>
                
                <div className="flex items-center gap-4">
                  <button onClick={onShuffleToggle} className={`p-2 ${isShuffle ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Shuffle className="w-5 h-5" />
                  </button>
                  <button onClick={onPrevious} className="p-2">
                    <SkipBack className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={onPlayPause}
                    className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  >
                    {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                  </button>
                  <button onClick={onNext} className="p-2">
                    <SkipForward className="w-6 h-6" />
                  </button>
                  <button onClick={onRepeatToggle} className={`p-2 ${isRepeat ? 'text-primary' : 'text-muted-foreground'}`}>
                    <Repeat className="w-5 h-5" />
                  </button>
                </div>

                <button onClick={handleShare} className="p-2">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center justify-center gap-3">
                <button onClick={onMuteToggle} className="p-2">
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={100}
                  onValueChange={([v]) => onVolumeChange(v)}
                  className="w-32"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
