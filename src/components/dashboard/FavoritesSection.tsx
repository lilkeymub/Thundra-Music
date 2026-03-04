import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Play, Pause, Trash2, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';

const favoriteTracks = [
  { id: '1', title: 'Electric Dreams', artist: 'Neon Pulse', duration: '3:45', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', addedAt: '2 days ago' },
  { id: '2', title: 'Midnight Groove', artist: 'Luna Wave', duration: '4:12', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300', addedAt: '1 week ago' },
  { id: '3', title: 'Savanna Sunset', artist: 'African Beats', duration: '5:03', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300', addedAt: '2 weeks ago' },
  { id: '4', title: 'City Lights', artist: 'Metro Sound', duration: '3:28', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300', addedAt: '1 month ago' },
];

interface FavoritesSectionProps {
  onPlayTrack: (track: any) => void;
  currentTrack: any;
  isPlaying: boolean;
}

export default function FavoritesSection({ onPlayTrack, currentTrack, isPlaying }: FavoritesSectionProps) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [favorites, setFavorites] = useState(favoriteTracks);

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(t => t.id !== id));
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <Heart className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Your Favorites</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Sign in to save your favorite tracks and access them anytime.
        </p>
        <Button onClick={() => openAuthModal({ mode: 'signup' })} size="lg">
          Sign Up Free
        </Button>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">No Favorites Yet</h2>
        <p className="text-muted-foreground mb-6">
          Start exploring and save tracks you love!
        </p>
        <Button onClick={() => window.location.href = '/dashboard/music'}>
          Browse Music
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
        <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center shadow-xl">
          <Heart className="w-20 h-20 text-primary-foreground fill-current" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground uppercase tracking-wider">Playlist</p>
          <h1 className="text-3xl lg:text-4xl font-display font-bold mb-2">Liked Songs</h1>
          <p className="text-muted-foreground">{favorites.length} songs</p>
          <div className="flex gap-3 mt-4">
            <Button className="bg-primary hover:bg-primary/90" onClick={() => onPlayTrack(favorites[0])}>
              <Play className="w-4 h-4 mr-2" />
              Play All
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-2">
        {favorites.map((track, i) => {
          const isCurrentTrack = currentTrack?.id === track.id;
          
          return (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-4 p-3 rounded-xl transition-colors cursor-pointer group ${
                isCurrentTrack ? 'bg-primary/10' : 'hover:bg-accent/50'
              }`}
              onClick={() => onPlayTrack(track)}
            >
              <span className="text-sm text-muted-foreground w-6 text-center group-hover:hidden">
                {i + 1}
              </span>
              <span className="text-sm text-muted-foreground w-6 text-center hidden group-hover:block">
                {isCurrentTrack && isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </span>
              
              <img src={track.cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isCurrentTrack ? 'text-primary' : ''}`}>
                  {track.title}
                </p>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
              </div>
              
              <span className="text-xs text-muted-foreground hidden md:block">{track.addedAt}</span>
              <span className="text-sm text-muted-foreground">{track.duration}</span>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-8 w-8" title="Download">
                  <Download className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={(e) => { e.stopPropagation(); removeFavorite(track.id); }}
                  title="Remove from favorites"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
