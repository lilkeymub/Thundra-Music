import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, History, X, Play, User, Music, Album } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const trendingSearches = ['Afrobeats', 'Burna Boy', 'Amapiano', 'Drake', 'Wizkid', 'Davido', 'Rema', 'Tems'];

const categories = [
  { name: 'Afrobeats', color: 'from-orange-500 to-red-500', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300' },
  { name: 'Hip Hop', color: 'from-purple-500 to-pink-500', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300' },
  { name: 'R&B', color: 'from-blue-500 to-cyan-500', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300' },
  { name: 'Electronic', color: 'from-green-500 to-teal-500', image: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=300' },
  { name: 'Amapiano', color: 'from-yellow-500 to-orange-500', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300' },
  { name: 'Gospel', color: 'from-indigo-500 to-purple-500', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300' },
  { name: 'Reggae', color: 'from-green-600 to-yellow-500', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300' },
  { name: 'Jazz', color: 'from-amber-600 to-yellow-600', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300' },
];

const searchResults = {
  tracks: [
    { id: '1', title: 'Electric Dreams', artist: 'Neon Pulse', type: 'track', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300' },
    { id: '2', title: 'Midnight Groove', artist: 'Luna Wave', type: 'track', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300' },
  ],
  artists: [
    { id: '1', name: 'Neon Pulse', followers: '1.2M', type: 'artist', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300' },
    { id: '2', name: 'African Beats', followers: '890K', type: 'artist', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300' },
  ],
  albums: [
    { id: '1', title: 'Summer Vibes', artist: 'Various Artists', type: 'album', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300' },
  ],
};

interface SearchSectionProps {
  onPlayTrack: (track: any) => void;
}

export default function SearchSection({ onPlayTrack }: SearchSectionProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(['Wizkid', 'Amapiano playlist', 'New releases']);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (searchTerm: string) => {
    setQuery(searchTerm);
    setIsSearching(true);
    if (!recentSearches.includes(searchTerm)) {
      setRecentSearches(prev => [searchTerm, ...prev.slice(0, 4)]);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsSearching(false);
  };

  const removeRecentSearch = (term: string) => {
    setRecentSearches(prev => prev.filter(s => s !== term));
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="What do you want to listen to?"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-12 pr-12 h-14 text-lg rounded-full bg-secondary"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {!isSearching ? (
        <>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <div
                    key={term}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full group"
                  >
                    <button onClick={() => handleSearch(term)} className="text-sm">
                      {term}
                    </button>
                    <button
                      onClick={() => removeRecentSearch(term)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trending Searches */}
          <section>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Trending Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          {/* Browse Categories */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Browse Categories</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <motion.button
                  key={category.name}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleSearch(category.name)}
                  className={`relative h-32 rounded-xl overflow-hidden bg-gradient-to-br ${category.color}`}
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                  />
                  <span className="absolute bottom-3 left-3 font-bold text-white text-lg">
                    {category.name}
                  </span>
                </motion.button>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* Search Results */
        <div className="space-y-8">
          {/* Tracks */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              Tracks
            </h3>
            <div className="space-y-2">
              {searchResults.tracks.map((track) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group"
                  onClick={() => onPlayTrack(track)}
                >
                  <img src={track.image} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                    <Play className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Artists */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Artists
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {searchResults.artists.map((artist) => (
                <motion.div
                  key={artist.id}
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 text-center cursor-pointer"
                >
                  <div className="w-28 h-28 rounded-full overflow-hidden mb-2 border-2 border-primary/20">
                    <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="font-medium truncate w-28">{artist.name}</p>
                  <p className="text-xs text-muted-foreground">{artist.followers} followers</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Albums */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Album className="w-5 h-5 text-primary" />
              Albums
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.albums.map((album) => (
                <motion.div
                  key={album.id}
                  whileHover={{ scale: 1.02 }}
                  className="glass-card rounded-xl overflow-hidden cursor-pointer"
                >
                  <img src={album.image} alt={album.title} className="w-full aspect-square object-cover" />
                  <div className="p-3">
                    <p className="font-medium truncate">{album.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{album.artist}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
