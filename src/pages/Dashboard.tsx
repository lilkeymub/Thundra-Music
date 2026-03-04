import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Library, Heart, User, Wallet, MessageCircle, GraduationCap, 
  ShoppingBag, Sparkles, LogOut, Settings, Menu, X, Play, Pause,
  SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart as HeartIcon,
  Plus, Search, Home, TrendingUp, Clock, Mic2, Maximize2, ListMusic, Megaphone, Crown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { usePlayLimit } from '@/hooks/usePlayLimit';
import { useLoginBonus } from '@/hooks/useLoginBonus';
import { useTracks } from '@/hooks/useTracks';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import thundraLogo from '@/assets/thundra-logo.jpg';
import ionToken from '@/assets/ion-token.png';
import { useUserRole } from '@/hooks/useUserRole';
import MusicSection from '@/components/dashboard/MusicSection';
import SearchSection from '@/components/dashboard/SearchSection';
import LibrarySection from '@/components/dashboard/LibrarySection';
import FavoritesSection from '@/components/dashboard/FavoritesSection';
import WalletSection from '@/components/dashboard/WalletSection';
import FullScreenPlayer from '@/components/dashboard/FullScreenPlayer';
import PlayLimitBanner from '@/components/dashboard/PlayLimitBanner';
import TrackCard from '@/components/dashboard/TrackCard';
import ChatSection from '@/components/dashboard/ChatSection';
import ProfileSection from '@/components/dashboard/ProfileSection';
import MarketplaceSection from '@/components/dashboard/MarketplaceSection';
import AIAssistantSection from '@/components/dashboard/AIAssistantSection';
import AdsSection from '@/components/dashboard/AdsSection';
import LearningSection from '@/components/dashboard/LearningSection';
import CookieBanner from '@/components/dashboard/CookieBanner';
import SubscriptionModal from '@/components/dashboard/SubscriptionModal';
import ArtistDashboard from '@/components/dashboard/ArtistDashboard';
import ModeratorDashboard from '@/components/dashboard/ModeratorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import SettingsSection from '@/components/dashboard/SettingsSection';
import LeaderboardSection from '@/components/dashboard/LeaderboardSection';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration?: string;
  cover_url?: string;
  cover?: string;
  genre?: string;
  plays_count?: number;
  lyrics?: string | null;
}

const playlists = [
  { id: '1', name: 'Discover Weekly', tracks: 30, cover: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300' },
  { id: '2', name: 'Afrobeats Hits', tracks: 50, cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300' },
  { id: '3', name: 'Chill Vibes', tracks: 25, cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300' },
];

const navItems = [
  { icon: Home, label: 'Home', path: '/dashboard' },
  { icon: Search, label: 'Search', path: '/dashboard/search' },
  { icon: Music, label: 'Music', path: '/dashboard/music' },
  { icon: Library, label: 'Library', path: '/dashboard/library' },
  { icon: Heart, label: 'Favorites', path: '/dashboard/favorites' },
  { icon: TrendingUp, label: 'Leaderboard', path: '/dashboard/leaderboard' },
];

const getSecondaryNav = (isArtist: boolean, isModerator: boolean, isAdmin: boolean) => {
  const baseNav = [
    { icon: User, label: 'Profile', path: '/dashboard/profile', requiresAuth: true },
    { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet', requiresAuth: true },
    { icon: MessageCircle, label: 'Chat Space', path: '/dashboard/chat', requiresAuth: true },
    { icon: GraduationCap, label: 'Learning', path: '/dashboard/learning', requiresAuth: true },
    { icon: ShoppingBag, label: 'Market', path: '/dashboard/market', requiresAuth: true },
    { icon: Sparkles, label: 'Thundra AI', path: '/dashboard/ai', requiresAuth: true },
    { icon: Megaphone, label: 'Ads', path: '/dashboard/ads', requiresAuth: true },
  ];

  if (isArtist) {
    baseNav.push({ icon: Mic2, label: 'Artist Studio', path: '/dashboard/artist', requiresAuth: true });
  }
  if (isModerator) {
    baseNav.push({ icon: Settings, label: 'Mod Panel', path: '/dashboard/moderator', requiresAuth: true });
  }
  if (isAdmin) {
    baseNav.push({ icon: Crown, label: 'Admin Panel', path: '/dashboard/admin', requiresAuth: true });
  }

  return baseNav;
};

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { remainingPlays, canPlay, recordPlay, FREE_PLAY_LIMIT, isPremiumUser } = usePlayLimit();
  const { isArtist, isModerator, isAdmin } = useUserRole();
  const { tracks: dbTracks, loading: tracksLoading } = useTracks();
  
  // Claim login bonus on mount (for logged in users)
  useLoginBonus();

  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [likedTracks, setLikedTracks] = useState<string[]>([]);
  const [fullScreenOpen, setFullScreenOpen] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [showQueue, setShowQueue] = useState(false);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);

  // Convert DB tracks to display format
  const sampleTracks: Track[] = dbTracks.length > 0 
    ? dbTracks.map(t => ({
        id: t.id,
        title: t.title,
        artist: t.artist,
        duration: t.duration || '3:45',
        cover_url: t.cover_url || undefined,
        cover: t.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
        genre: t.genre || 'Music',
        plays_count: t.plays_count,
        lyrics: t.lyrics
      }))
    : [
        { id: '1', title: 'Electric Dreams', artist: 'Neon Pulse', duration: '3:45', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', genre: 'Electronic', plays_count: 1200000 },
        { id: '2', title: 'Midnight Groove', artist: 'Luna Wave', duration: '4:12', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300', genre: 'R&B', plays_count: 890000 },
        { id: '3', title: 'Savanna Sunset', artist: 'African Beats', duration: '5:03', cover: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300', genre: 'Afrobeats', plays_count: 2100000 },
        { id: '4', title: 'City Lights', artist: 'Metro Sound', duration: '3:28', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300', genre: 'Hip Hop', plays_count: 756000 },
        { id: '5', title: 'Ocean Waves', artist: 'Calm Waters', duration: '6:15', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300', genre: 'Ambient', plays_count: 1500000 },
        { id: '6', title: 'Dance Floor', artist: 'DJ Thunder', duration: '4:45', cover: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=300', genre: 'House', plays_count: 3200000 },
      ];

  useEffect(() => {
    if (sampleTracks.length > 0 && !currentTrack) {
      setCurrentTrack(sampleTracks[0]);
      setQueue(sampleTracks);
    }
  }, [sampleTracks, currentTrack]);

  useEffect(() => {
    const path = location.pathname.split('/dashboard/')[1] || 'home';
    setActiveSection(path);
  }, [location]);

  // Simulate progress when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 0.5));
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleNavClick = (path: string, requiresAuth: boolean = false) => {
    if (requiresAuth && !user) {
      openAuthModal({ 
        mode: 'login', 
        message: 'Please sign in to access this feature' 
      });
      return;
    }
    navigate(path);
    setSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handlePlayTrack = async (track: Track) => {
    // Check play limit for free users
    if (!isPremiumUser && !canPlay()) {
      openAuthModal({ 
        mode: 'signup', 
        message: `You've reached your daily limit of ${FREE_PLAY_LIMIT} songs. Upgrade to Premium for unlimited listening!` 
      });
      return;
    }

    // Record the play
    await recordPlay();

    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);

    // Update queue
    const trackIndex = sampleTracks.findIndex(t => t.id === track.id);
    if (trackIndex !== -1) {
      const newQueue = isShuffle 
        ? [...sampleTracks].sort(() => Math.random() - 0.5)
        : sampleTracks;
      setQueue(newQueue);
    }
  };

  const handleNext = () => {
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    handlePlayTrack(queue[nextIndex]);
  };

  const handlePrevious = () => {
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    handlePlayTrack(queue[prevIndex]);
  };

  const toggleLike = (trackId: string) => {
    if (!user) {
      openAuthModal({ mode: 'login', message: 'Sign in to save your favorite tracks' });
      return;
    }
    setLikedTracks(prev => 
      prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-border/50 h-14">
        <div className="flex items-center justify-between px-4 h-full">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src={thundraLogo} alt="Thundra" className="w-8 h-8 rounded-lg" />
            <span className="font-display font-bold"><span className="text-primary">THUNDRA</span> <span className="hidden sm:inline">MUSIC</span></span>
          </div>
          <div className="w-9" />
        </div>
      </header>

      <div className="flex flex-1 pt-14 lg:pt-0">
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{ x: sidebarOpen ? 0 : '-100%' }}
          className="fixed lg:relative left-0 top-0 h-full w-64 bg-card border-r border-border z-50 lg:z-auto lg:translate-x-0 flex flex-col"
          style={{ transform: undefined }}
        >
          <div className="hidden lg:block" />
          
          {/* Logo */}
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-border lg:border-none">
            <div className="flex items-center gap-3">
              <img src={thundraLogo} alt="Thundra" className="w-10 h-10 rounded-lg" />
              <div>
                <h1 className="font-display font-bold text-lg">
                  <span className="text-primary">THUNDRA</span> <span className="text-sm">MUSIC</span>
                </h1>
                <p className="text-xs text-muted-foreground capitalize">
                  {user ? `${profile?.tier || 'free'} User` : 'Free Mode'}
                </p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-2 lg:p-4 space-y-1">
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground px-3 mb-2">MENU</p>
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    activeSection === (item.path.split('/dashboard/')[1] || 'home')
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground px-3 mb-2">FEATURES</p>
              {getSecondaryNav(isArtist, isModerator, isAdmin).map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path, item.requiresAuth)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    activeSection === item.path.split('/dashboard/')[1]
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.requiresAuth && !user && (
                    <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">PRO</span>
                  )}
                </button>
              ))}
            </div>

            {/* Playlists */}
            <div>
              <p className="text-xs font-medium text-muted-foreground px-3 mb-2">YOUR PLAYLISTS</p>
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => user ? null : openAuthModal({ message: 'Sign in to access your playlists' })}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <img src={playlist.cover} alt={playlist.name} className="w-8 h-8 rounded object-cover" />
                  <div className="text-left">
                    <p className="text-sm font-medium truncate">{playlist.name}</p>
                    <p className="text-xs text-muted-foreground">{playlist.tracks} tracks</p>
                  </div>
                </button>
              ))}
              <button 
                onClick={() => user ? null : openAuthModal({ message: 'Sign in to create playlists' })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-sm">Create Playlist</span>
              </button>
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border space-y-1">
            {/* Subscription Button - Show for free/premium users */}
            {user && profile?.tier !== 'vip' && (
              <button
                onClick={() => setSubscriptionModalOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-r from-yellow-500/20 to-primary/20 text-primary hover:from-yellow-500/30 hover:to-primary/30 transition-colors mb-2"
              >
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium">
                  {profile?.tier === 'premium' ? 'Upgrade to VIP' : 'Buy Subscription'}
                </span>
              </button>
            )}
            
            <button
              onClick={() => handleNavClick('/dashboard/settings', true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Settings</span>
            </button>
            {user ? (
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Log Out</span>
              </button>
            ) : (
              <Button
                onClick={() => openAuthModal({ mode: 'signup' })}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Sign Up Free
              </Button>
            )}
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen lg:min-h-0 overflow-hidden">
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto pb-28 lg:pb-24">
            <div className="p-4 lg:p-6 xl:p-8">
              {/* Play Limit Banner */}
              {!isPremiumUser && activeSection === 'home' && (
                <PlayLimitBanner remainingPlays={remainingPlays} totalPlays={FREE_PLAY_LIMIT} />
              )}

              {/* Welcome Banner */}
              {activeSection === 'home' && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-xl lg:rounded-2xl bg-gradient-to-br from-primary/30 via-primary/10 to-background p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8"
                  >
                    <div className="relative z-10">
                      <p className="text-xs sm:text-sm text-primary font-medium mb-1 sm:mb-2">
                        {user ? 'Welcome back,' : 'Welcome to Thundra Music'}
                      </p>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mb-1 sm:mb-2">
                        {user ? `${profile?.full_name || profile?.username || 'Music Lover'}! 🎵` : 'Start Listening Free! 🎵'}
                      </h2>
                      <p className="text-sm text-muted-foreground max-w-md">
                        {user 
                          ? 'Your personalized music recommendation is ready.'
                          : 'Discover amazing music from independent artists around the world.'
                        }
                      </p>
                      {!user && (
                        <Button 
                          className="mt-4 bg-primary hover:bg-primary/90"
                          onClick={() => openAuthModal({ mode: 'signup' })}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          Sign Up for Full Access
                        </Button>
                      )}
                    </div>
                    <div className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 opacity-10 lg:opacity-20">
                      <Music className="w-24 sm:w-32 lg:w-48 h-24 sm:h-32 lg:h-48" />
                    </div>
                  </motion.div>

                  {/* Stats - Only for logged in users */}
                  {user && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6 lg:mb-8">
                      {[
                        { label: 'THDR Balance', value: `${profile?.thdr_balance || 0}`, icon: thundraLogo, isImage: true },
                        { label: 'ION Balance', value: `${profile?.ion_balance || 0}`, icon: ionToken, isImage: true },
                        { label: 'Total Streams', value: profile?.total_streams || 0, icon: '🎧', isImage: false },
                        { label: 'Total Likes', value: profile?.total_likes || 0, icon: '❤️', isImage: false },
                      ].map((stat, i) => (
                        <motion.div
                          key={stat.label}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="glass-card p-4 lg:p-6 rounded-xl"
                        >
                          {stat.isImage ? (
                            <img src={stat.icon as string} alt={stat.label} className="w-8 h-8 lg:w-10 lg:h-10 rounded-full" />
                          ) : (
                            <span className="text-xl lg:text-2xl">{stat.icon}</span>
                          )}
                          <p className="text-lg lg:text-2xl font-bold mt-2">{stat.value}</p>
                          <p className="text-xs lg:text-sm text-muted-foreground">{stat.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Trending Section */}
                  <section className="mb-6 lg:mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg lg:text-xl font-display font-bold flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Trending Now
                      </h3>
                      <Button variant="ghost" size="sm">See All</Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4">
                      {sampleTracks.slice(0, 6).map((track) => (
                        <TrackCard
                          key={track.id}
                          track={track}
                          isPlaying={isPlaying}
                          isCurrentTrack={currentTrack?.id === track.id}
                          onPlay={() => handlePlayTrack(track)}
                          onOpenComments={() => {
                            setCurrentTrack(track);
                            setFullScreenOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </section>

                  {/* Recently Played */}
                  <section className="mb-6 lg:mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg lg:text-xl font-display font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Recently Played
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {sampleTracks.slice(0, 4).map((track, i) => (
                        <motion.div
                          key={track.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                          onClick={() => handlePlayTrack(track)}
                        >
                          <img src={track.cover_url || track.cover} alt={track.title} className="w-12 h-12 rounded-lg object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{track.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                          </div>
                          <span className="text-xs text-muted-foreground hidden sm:block">{track.duration}</span>
                          <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 h-8 w-8">
                            <Play className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* Featured Artists */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg lg:text-xl font-display font-bold flex items-center gap-2">
                        <Mic2 className="w-5 h-5 text-primary" />
                        Featured Artists
                      </h3>
                      <Button variant="ghost" size="sm">See All</Button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
                      {['Neon Pulse', 'Luna Wave', 'African Beats', 'Metro Sound', 'Calm Waters'].map((artist, i) => (
                        <motion.div
                          key={artist}
                          whileHover={{ scale: 1.05 }}
                          className="flex-shrink-0 text-center cursor-pointer"
                          onClick={() => !user && openAuthModal({ message: 'Sign in to follow artists' })}
                        >
                          <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden mb-2 border-2 border-primary/20">
                            <img 
                              src={sampleTracks[i % sampleTracks.length]?.cover_url || sampleTracks[i % sampleTracks.length]?.cover} 
                              alt={artist} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-medium truncate w-24 lg:w-28">{artist}</p>
                          <p className="text-xs text-muted-foreground">Artist</p>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </>
              )}


              {activeSection === 'search' && (
                <SearchSection onPlayTrack={handlePlayTrack} />
              )}

              {activeSection === 'music' && (
                <MusicSection onPlayTrack={handlePlayTrack} currentTrack={currentTrack} isPlaying={isPlaying} />
              )}

              {activeSection === 'library' && (
                <LibrarySection onPlayTrack={handlePlayTrack} />
              )}

              {activeSection === 'favorites' && (
                <FavoritesSection onPlayTrack={handlePlayTrack} currentTrack={currentTrack} isPlaying={isPlaying} />
              )}

              {activeSection === 'leaderboard' && (
                <LeaderboardSection />
              )}

              {activeSection === 'wallet' && user && (
                <WalletSection />
              )}

              {activeSection === 'learning' && user && (
                <LearningSection />
              )}

              {activeSection === 'profile' && user && (
                <ProfileSection />
              )}

              {activeSection === 'chat' && user && (
                <ChatSection />
              )}

              {activeSection === 'market' && user && (
                <MarketplaceSection />
              )}

              {activeSection === 'ai' && user && (
                <AIAssistantSection />
              )}

              {activeSection === 'ads' && user && (
                <AdsSection />
              )}

              {activeSection === 'artist' && user && isArtist && (
                <ArtistDashboard />
              )}

              {activeSection === 'moderator' && user && isModerator && (
                <ModeratorDashboard />
              )}

              {activeSection === 'admin' && user && isAdmin && (
                <AdminDashboard />
              )}

              {activeSection === 'settings' && user && (
                <SettingsSection />
              )}
            </div>
          </div>

          {/* Music Player */}
          {currentTrack && (
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 glass border-t border-border z-30">
              <div className="px-3 lg:px-4 py-2 lg:py-3">
                {/* Progress bar */}
                <div className="mb-2 lg:hidden">
                  <Slider
                    value={[progress]}
                    max={100}
                    step={0.1}
                    className="w-full"
                    onValueChange={([v]) => setProgress(v)}
                  />
                </div>
                
                <div className="flex items-center gap-3 lg:gap-4">
                  {/* Track Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img 
                      src={currentTrack.cover_url || currentTrack.cover} 
                      alt={currentTrack.title} 
                      className="w-10 h-10 lg:w-14 lg:h-14 rounded-lg object-cover cursor-pointer"
                      onClick={() => setFullScreenOpen(true)}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{currentTrack.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{currentTrack.artist}</p>
                    </div>
                    <button 
                      onClick={() => toggleLike(currentTrack.id)}
                      className="hidden sm:block p-2 hover:bg-accent rounded-full"
                    >
                      <HeartIcon className={`w-4 h-4 ${likedTracks.includes(currentTrack.id) ? 'fill-primary text-primary' : ''}`} />
                    </button>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col items-center gap-1 lg:flex-1">
                    <div className="flex items-center gap-1 lg:gap-2">
                      <button 
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={`p-2 rounded-full hidden lg:block ${isShuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>
                      <button onClick={handlePrevious} className="p-2 text-muted-foreground hover:text-foreground">
                        <SkipBack className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                      </button>
                      <button onClick={handleNext} className="p-2 text-muted-foreground hover:text-foreground">
                        <SkipForward className="w-4 h-4 lg:w-5 lg:h-5" />
                      </button>
                      <button 
                        onClick={() => setIsRepeat(!isRepeat)}
                        className={`p-2 rounded-full hidden lg:block ${isRepeat ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        <Repeat className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Desktop Progress */}
                    <div className="hidden lg:flex items-center gap-2 w-full max-w-md">
                      <span className="text-xs text-muted-foreground w-10 text-right">
                        {Math.floor(progress * 2.25 / 60)}:{String(Math.floor(progress * 2.25 % 60)).padStart(2, '0')}
                      </span>
                      <Slider
                        value={[progress]}
                        max={100}
                        step={0.1}
                        className="flex-1"
                        onValueChange={([v]) => setProgress(v)}
                      />
                      <span className="text-xs text-muted-foreground w-10">{currentTrack.duration}</span>
                    </div>
                  </div>

                  {/* Right Controls */}
                  <div className="hidden lg:flex items-center gap-2 flex-1 justify-end">
                    <button onClick={() => setShowQueue(!showQueue)} className="p-2 hover:bg-accent rounded-full">
                      <ListMusic className="w-4 h-4" />
                    </button>
                    <button onClick={() => setFullScreenOpen(true)} className="p-2 hover:bg-accent rounded-full">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setIsMuted(!isMuted)} className="p-2">
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      max={100}
                      className="w-24"
                      onValueChange={([v]) => { setVolume(v); setIsMuted(false); }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Full Screen Player */}
      <FullScreenPlayer
        isOpen={fullScreenOpen}
        onClose={() => setFullScreenOpen(false)}
        track={currentTrack}
        isPlaying={isPlaying}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onNext={handleNext}
        onPrevious={handlePrevious}
        progress={progress}
        onProgressChange={setProgress}
        volume={volume}
        onVolumeChange={(v) => { setVolume(v); setIsMuted(false); }}
        isMuted={isMuted}
        onMuteToggle={() => setIsMuted(!isMuted)}
        isRepeat={isRepeat}
        onRepeatToggle={() => setIsRepeat(!isRepeat)}
        isShuffle={isShuffle}
        onShuffleToggle={() => setIsShuffle(!isShuffle)}
        queue={queue}
        onPlayFromQueue={handlePlayTrack}
      />

      {/* Cookie Banner */}
      <CookieBanner />

      {/* Subscription Modal */}
      <SubscriptionModal 
        isOpen={subscriptionModalOpen} 
        onClose={() => setSubscriptionModalOpen(false)}
        currentTier={profile?.tier as 'free' | 'premium' | 'vip' || 'free'}
      />
    </div>
  );
}
