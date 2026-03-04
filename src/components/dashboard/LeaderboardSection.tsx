import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Music, Users, TrendingUp, Play, Heart, 
  Share2, Star, Crown, Medal, Award, Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Artist {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  total_streams: number;
  total_likes: number;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  plays_count: number;
  likes_count: number;
}

interface TopUser {
  id: string;
  username: string;
  avatar_url: string | null;
  tier: string;
  thdr_balance: number;
  total_streams: number;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
    case 2: return <Medal className="w-5 h-5 text-gray-400" />;
    case 3: return <Award className="w-5 h-5 text-amber-600" />;
    default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{rank}</span>;
  }
};

const getRankBg = (rank: number) => {
  switch (rank) {
    case 1: return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
    case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
    case 3: return 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 border-amber-500/30';
    default: return 'bg-secondary/50';
  }
};

export default function LeaderboardSection() {
  const { t } = useLanguage();
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboards = async () => {
      setLoading(true);

      // Fetch top artists (users with artist role by streams)
      const { data: artistsData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, total_streams, total_likes')
        .order('total_streams', { ascending: false })
        .limit(10);

      if (artistsData) {
        setTopArtists(artistsData.map(a => ({
          ...a,
          total_streams: a.total_streams || 0,
          total_likes: a.total_likes || 0,
        })));
      }

      // Fetch top tracks
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('id, title, artist, cover_url, plays_count, likes_count')
        .order('plays_count', { ascending: false })
        .limit(10);

      if (tracksData) {
        setTopTracks(tracksData.map(t => ({
          ...t,
          plays_count: t.plays_count || 0,
          likes_count: t.likes_count || 0,
        })));
      }

      // Fetch top users by engagement
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, tier, thdr_balance, total_streams')
        .order('thdr_balance', { ascending: false })
        .limit(10);

      if (usersData) {
        setTopUsers(usersData.map(u => ({
          ...u,
          thdr_balance: u.thdr_balance || 0,
          total_streams: u.total_streams || 0,
        })));
      }

      setLoading(false);
    };

    fetchLeaderboards();
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Leaderboards
          </h2>
          <p className="text-muted-foreground">Top performers in the Thundra ecosystem</p>
        </div>
      </div>

      <Tabs defaultValue="artists" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="artists" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Top Artists
          </TabsTrigger>
          <TabsTrigger value="tracks" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            Top Songs
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Top Users
          </TabsTrigger>
        </TabsList>

        {/* Top Artists */}
        <TabsContent value="artists" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Artists by Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                      <div className="w-8 h-8 bg-secondary rounded-full" />
                      <div className="w-12 h-12 bg-secondary rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-1/3" />
                        <div className="h-3 bg-secondary rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topArtists.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-4">
                    {topArtists.map((artist, i) => (
                      <motion.div
                        key={artist.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-4 p-3 rounded-lg border ${getRankBg(i + 1)}`}
                      >
                        <div className="w-8 flex justify-center">
                          {getRankIcon(i + 1)}
                        </div>
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden">
                          {artist.avatar_url ? (
                            <img src={artist.avatar_url} alt={artist.username || ''} className="w-full h-full object-cover" />
                          ) : (
                            <Music className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{artist.full_name || artist.username}</p>
                          <p className="text-sm text-muted-foreground">@{artist.username}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{formatNumber(artist.total_streams)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Play className="w-3 h-3" /> streams
                          </p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="font-medium">{formatNumber(artist.total_likes)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Heart className="w-3 h-3" /> likes
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No artists found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Tracks */}
        <TabsContent value="tracks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Top Songs by Plays
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                      <div className="w-8 h-8 bg-secondary rounded-full" />
                      <div className="w-12 h-12 bg-secondary rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-1/2" />
                        <div className="h-3 bg-secondary rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topTracks.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-4">
                    {topTracks.map((track, i) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-4 p-3 rounded-lg border ${getRankBg(i + 1)}`}
                      >
                        <div className="w-8 flex justify-center">
                          {getRankIcon(i + 1)}
                        </div>
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                          {track.cover_url ? (
                            <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                              <Music className="w-6 h-6 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{formatNumber(track.plays_count)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Play className="w-3 h-3" /> plays
                          </p>
                        </div>
                        <div className="text-right hidden sm:block">
                          <p className="font-medium">{formatNumber(track.likes_count)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                            <Heart className="w-3 h-3" /> likes
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tracks found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Users */}
        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" />
                Top Users by Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                      <div className="w-8 h-8 bg-secondary rounded-full" />
                      <div className="w-12 h-12 bg-secondary rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-1/3" />
                        <div className="h-3 bg-secondary rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topUsers.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-4">
                    {topUsers.map((user, i) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-4 p-3 rounded-lg border ${getRankBg(i + 1)}`}
                      >
                        <div className="w-8 flex justify-center">
                          {getRankIcon(i + 1)}
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username || ''} className="w-full h-full object-cover" />
                          ) : (
                            <Users className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate flex items-center gap-2">
                            @{user.username}
                            <Badge variant="outline" className="text-xs capitalize">
                              {user.tier}
                            </Badge>
                          </p>
                          <p className="text-sm text-muted-foreground">{formatNumber(user.total_streams)} streams</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{formatNumber(user.thdr_balance)}</p>
                          <p className="text-xs text-muted-foreground">THDR</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
