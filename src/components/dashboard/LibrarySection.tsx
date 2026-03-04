import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Plus, Music, ListMusic, Clock, Play, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';

const userPlaylists = [
  { id: '1', name: 'My Favorites', tracks: 24, cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', isOwn: true },
  { id: '2', name: 'Workout Mix', tracks: 18, cover: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=300', isOwn: true },
  { id: '3', name: 'Chill Vibes', tracks: 32, cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300', isOwn: true },
  { id: '4', name: 'Discover Weekly', tracks: 30, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300', isOwn: false },
  { id: '5', name: 'Afrobeats Hits', tracks: 50, cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300', isOwn: false },
];

const recentlyPlayed = [
  { id: '1', title: 'Electric Dreams', artist: 'Neon Pulse', playedAt: '2 hours ago', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300' },
  { id: '2', title: 'Midnight Groove', artist: 'Luna Wave', playedAt: '5 hours ago', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300' },
  { id: '3', title: 'Savanna Sunset', artist: 'African Beats', playedAt: 'Yesterday', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300' },
];

interface LibrarySectionProps {
  onPlayTrack: (track: any) => void;
}

export default function LibrarySection({ onPlayTrack }: LibrarySectionProps) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [playlists, setPlaylists] = useState(userPlaylists);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'playlists' | 'recent'>('playlists');

  const handleCreatePlaylist = () => {
    if (!user) {
      openAuthModal({ mode: 'signup', message: 'Create an account to make playlists' });
      return;
    }
    if (newPlaylistName.trim()) {
      const newPlaylist = {
        id: Date.now().toString(),
        name: newPlaylistName,
        tracks: 0,
        cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
        isOwn: true,
      };
      setPlaylists([newPlaylist, ...playlists]);
      setNewPlaylistName('');
      setIsCreateOpen(false);
    }
  };

  const handleDeletePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
  };

  if (!user) {
    return (
      <div className="text-center py-16">
        <Library className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-display font-bold mb-2">Your Library</h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Sign in to create playlists, save your favorite songs, and access your listening history.
        </p>
        <Button onClick={() => openAuthModal({ mode: 'signup' })} size="lg">
          Sign Up Free
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold flex items-center gap-2">
          <Library className="w-6 h-6 text-primary" />
          Your Library
        </h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Playlist name"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
              <Button onClick={handleCreatePlaylist} className="w-full">
                Create Playlist
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('playlists')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'playlists' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ListMusic className="w-4 h-4 inline mr-2" />
          Playlists
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'recent' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-2" />
          Recently Played
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'playlists' ? (
          <motion.div
            key="playlists"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {playlists.map((playlist) => (
              <motion.div
                key={playlist.id}
                whileHover={{ scale: 1.02 }}
                className="glass-card rounded-xl overflow-hidden group cursor-pointer"
              >
                <div className="relative aspect-square">
                  <img src={playlist.cover} alt={playlist.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
                    </button>
                  </div>
                  {playlist.isOwn && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button className="p-2 rounded-full bg-black/50 hover:bg-black/70">
                        <Pencil className="w-3 h-3 text-white" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist.id); }}
                        className="p-2 rounded-full bg-black/50 hover:bg-red-500"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{playlist.name}</p>
                  <p className="text-xs text-muted-foreground">{playlist.tracks} tracks</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="recent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {recentlyPlayed.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => onPlayTrack(track)}
              >
                <img src={track.cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">{track.playedAt}</span>
                <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                  <Play className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
