import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Play, Pause, Heart, MoreHorizontal, Filter, Grid, List, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useAuth } from '@/hooks/useAuth';

const genres = ['All', 'Afrobeats', 'Hip Hop', 'R&B', 'Electronic', 'Amapiano', 'Reggae', 'Jazz', 'Gospel'];

const allTracks = [
  { id: '1', title: 'Electric Dreams', artist: 'Neon Pulse', duration: '3:45', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', genre: 'Electronic', plays: '1.2M' },
  { id: '2', title: 'Midnight Groove', artist: 'Luna Wave', duration: '4:12', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300', genre: 'R&B', plays: '890K' },
  { id: '3', title: 'Savanna Sunset', artist: 'African Beats', duration: '5:03', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300', genre: 'Afrobeats', plays: '2.1M' },
  { id: '4', title: 'City Lights', artist: 'Metro Sound', duration: '3:28', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300', genre: 'Hip Hop', plays: '756K' },
  { id: '5', title: 'Ocean Waves', artist: 'Calm Waters', duration: '6:15', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300', genre: 'Amapiano', plays: '1.5M' },
  { id: '6', title: 'Dance Floor', artist: 'DJ Thunder', duration: '4:45', cover: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=300', genre: 'Electronic', plays: '3.2M' },
  { id: '7', title: 'Lagos Vibes', artist: 'Afro King', duration: '3:55', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300', genre: 'Afrobeats', plays: '4.1M' },
  { id: '8', title: 'Soul Journey', artist: 'Mystic Soul', duration: '5:20', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300', genre: 'R&B', plays: '620K' },
];

interface MusicSectionProps {
  onPlayTrack: (track: any) => void;
  currentTrack: any;
  isPlaying: boolean;
}

export default function MusicSection({ onPlayTrack, currentTrack, isPlaying }: MusicSectionProps) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [likedTracks, setLikedTracks] = useState<string[]>([]);

  const filteredTracks = allTracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || track.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const toggleLike = (trackId: string) => {
    if (!user) {
      openAuthModal({ mode: 'login', message: 'Sign in to save your favorite tracks' });
      return;
    }
    setLikedTracks(prev => 
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <Music className="w-6 h-6 text-primary" />
          Browse Music
        </h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tracks or artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex border border-border rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'} rounded-l-lg`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'} rounded-r-lg`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedGenre === genre
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Tracks */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredTracks.map((track) => (
            <motion.div
              key={track.id}
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl overflow-hidden group cursor-pointer"
              onClick={() => onPlayTrack(track)}
            >
              <div className="relative aspect-square">
                <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    {currentTrack?.id === track.id && isPlaying ? (
                      <Pause className="w-5 h-5 text-primary-foreground" />
                    ) : (
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className={`w-4 h-4 ${likedTracks.includes(track.id) ? 'fill-primary text-primary' : 'text-white'}`} />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-xs text-white">
                  {track.genre}
                </div>
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                <p className="text-xs text-primary mt-1">{track.plays} plays</p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group"
              onClick={() => onPlayTrack(track)}
            >
              <span className="text-sm text-muted-foreground w-6 text-center">{i + 1}</span>
              <img src={track.cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{track.title}</p>
                <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
              </div>
              <span className="text-sm text-muted-foreground hidden sm:block">{track.genre}</span>
              <span className="text-sm text-primary hidden sm:block">{track.plays}</span>
              <span className="text-sm text-muted-foreground">{track.duration}</span>
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(track.id); }}
                className="p-2 hover:bg-accent rounded-full"
              >
                <Heart className={`w-4 h-4 ${likedTracks.includes(track.id) ? 'fill-primary text-primary' : ''}`} />
              </button>
              <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}

      {filteredTracks.length === 0 && (
        <div className="text-center py-12">
          <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tracks found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  );
}
