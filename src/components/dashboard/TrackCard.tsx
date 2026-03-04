import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Heart, Share2, MessageCircle, MoreVertical,
  FileText, BookOpen, Download, ListPlus, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';
import { useLanguage } from '@/contexts/LanguageContext';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url?: string;
  cover?: string;
  duration?: string;
  genre?: string;
  plays_count?: number;
  plays?: string;
  lyrics?: string | null;
  story?: string | null;
}

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: () => void;
  onOpenComments?: () => void;
  onOpenLyrics?: () => void;
  onOpenStory?: () => void;
  onAddToQueue?: () => void;
  onAddToFavorites?: () => void;
}

export default function TrackCard({ 
  track, 
  isPlaying, 
  isCurrentTrack, 
  onPlay, 
  onOpenComments,
  onOpenLyrics,
  onOpenStory,
  onAddToQueue,
  onAddToFavorites
}: TrackCardProps) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const { hasRole } = useUserRole();
  const { t } = useLanguage();
  const [liked, setLiked] = useState(false);

  const coverUrl = track.cover_url || track.cover;
  const playsDisplay = track.plays_count 
    ? (track.plays_count >= 1000000 
        ? `${(track.plays_count / 1000000).toFixed(1)}M` 
        : track.plays_count >= 1000 
          ? `${(track.plays_count / 1000).toFixed(0)}K`
          : track.plays_count.toString())
    : track.plays || '0';

  const canDownload = hasRole('premium') || hasRole('vip') || hasRole('artist');

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal({ mode: 'login', message: 'Sign in to like tracks' });
      return;
    }
    setLiked(!liked);
    onAddToFavorites?.();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/track/${track.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${track.title} by ${track.artist}`,
          text: `Listen to ${track.title} on Thundra Music!`,
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

  const handleComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal({ mode: 'login', message: 'Sign in to view comments' });
      return;
    }
    onOpenComments?.();
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    toast({ title: 'Downloading...', description: `${track.title} will be downloaded` });
  };

  const handleAddToQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal({ mode: 'login', message: 'Sign in to add to queue' });
      return;
    }
    onAddToQueue?.();
    toast({ title: 'Added to queue', description: `${track.title} added to queue` });
  };

  const handleViewLyrics = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenLyrics?.();
  };

  const handleViewStory = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenStory?.();
  };

  const handleAddToFavorites = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal({ mode: 'login', message: 'Sign in to add to favorites' });
      return;
    }
    setLiked(true);
    onAddToFavorites?.();
    toast({ title: 'Added to favorites', description: `${track.title} added to favorites` });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="glass-card rounded-xl overflow-hidden group cursor-pointer"
      onClick={onPlay}
    >
      <div className="relative aspect-square">
        <img src={coverUrl} alt={track.title} className="w-full h-full object-cover" />
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleLike}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-primary text-primary' : 'text-white'}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <Share2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleComments}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-white" />
          </button>
          
          {/* 3-dot menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleViewLyrics}>
                <FileText className="w-4 h-4 mr-2" />
                View Lyrics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewStory}>
                <BookOpen className="w-4 h-4 mr-2" />
                Story
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
                {!canDownload && <span className="ml-auto text-xs text-muted-foreground">PRO</span>}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddToFavorites}>
                <Heart className="w-4 h-4 mr-2" />
                Add to Favorites
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddToQueue}>
                <ListPlus className="w-4 h-4 mr-2" />
                Add to Queue
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Genre badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
          {track.genre}
        </div>
      </div>

      <div className="p-3">
        <p className="font-medium text-sm truncate">{track.title}</p>
        <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
        <p className="text-xs text-primary mt-1">{playsDisplay} plays</p>
      </div>
    </motion.div>
  );
}
