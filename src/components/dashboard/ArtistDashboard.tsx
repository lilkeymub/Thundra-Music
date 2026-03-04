import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Music, TrendingUp, DollarSign, Users, Upload, Disc, 
  BarChart2, Heart, Play, Eye, Award, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import thundraLogo from '@/assets/thundra-logo.jpg';
import PriceTracker from './PriceTracker';
import UploadTrackModal from './UploadTrackModal';

interface Earning {
  id: string;
  earning_type: string;
  amount: number;
  token_symbol: string;
  created_at: string;
}

interface TrackStats {
  id: string;
  title: string;
  plays_count: number;
  likes_count: number;
}

export default function ArtistDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { getPrice } = useTokenPrices();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [tracks, setTracks] = useState<TrackStats[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const thdrPrice = getPrice('THDR');
  const earningsUsd = totalEarnings * thdrPrice;

  useEffect(() => {
    if (!user) return;

    const fetchArtistData = async () => {
      // Fetch earnings
      const { data: earningsData } = await supabase
        .from('artist_earnings')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (earningsData) {
        setEarnings(earningsData);
        setTotalEarnings(earningsData.reduce((sum, e) => sum + Number(e.amount), 0));
      }

      // Fetch tracks
      const { data: tracksData } = await supabase
        .from('tracks')
        .select('id, title, plays_count, likes_count')
        .eq('artist', profile?.username || '')
        .order('plays_count', { ascending: false })
        .limit(5);

      if (tracksData) {
        setTracks(tracksData);
      }

      // Fetch followers count
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      setFollowers(count || 0);
    };

    fetchArtistData();
  }, [user, profile]);

  const handleUploadSuccess = () => {
    toast({ title: 'Success', description: 'Track uploaded successfully!' });
    // Refresh tracks
    if (profile?.username) {
      supabase
        .from('tracks')
        .select('id, title, plays_count, likes_count')
        .eq('artist', profile.username)
        .order('plays_count', { ascending: false })
        .limit(5)
        .then(({ data }) => {
          if (data) setTracks(data);
        });
    }
  };

  const stats = [
    { 
      label: 'Total Earnings', 
      value: `${totalEarnings.toFixed(2)} THDR`, 
      subValue: `≈ $${earningsUsd.toFixed(2)}`,
      icon: DollarSign, 
      color: 'text-green-500', 
      bg: 'bg-green-500/10' 
    },
    { label: 'Followers', value: followers.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Streams', value: profile?.total_streams?.toLocaleString() || '0', icon: Play, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Total Likes', value: profile?.total_likes?.toLocaleString() || '0', icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Music className="w-6 h-6 text-red-500" />
            Artist Dashboard
          </h2>
          <p className="text-muted-foreground">Manage your music and track your earnings</p>
        </div>
        <div className="flex items-center gap-3">
          <PriceTracker token="THDR" compact />
          <Button onClick={() => setUploadModalOpen(true)} className="bg-red-500 hover:bg-red-600">
            <Upload className="w-4 h-4 mr-2" />
            Upload Track
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                {stat.subValue && (
                  <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                )}
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Artist Rank */}
      <Card className="bg-gradient-to-r from-red-500/20 to-orange-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <Award className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Artist Rank: Level 1</h3>
                <p className="text-muted-foreground">Earn more to unlock higher tiers and bonuses</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-sm text-red-500 font-medium">2.5x Reward Multiplier</span>
                  <span className="text-xs text-muted-foreground">• Verified Artist Badge</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-red-500">150%</p>
              <p className="text-sm text-muted-foreground">Bonus Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {earnings.length > 0 ? (
              <div className="space-y-3">
                {earnings.map((earning) => (
                  <div key={earning.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        earning.earning_type === 'tip' ? 'bg-yellow-500/20 text-yellow-500' :
                        earning.earning_type === 'stream' ? 'bg-green-500/20 text-green-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                        {earning.earning_type === 'tip' ? '💝' : earning.earning_type === 'stream' ? '▶' : '🎵'}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{earning.earning_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(earning.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-500">+{earning.amount} {earning.token_symbol}</span>
                      <p className="text-xs text-muted-foreground">
                        ≈ ${(earning.amount * thdrPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No earnings yet</p>
                <p className="text-sm">Upload tracks and get streams to start earning!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Tracks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Disc className="w-5 h-5 text-primary" />
              Your Top Tracks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tracks.length > 0 ? (
              <div className="space-y-3">
                {tracks.map((track, i) => (
                  <div key={track.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium truncate">{track.title}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" /> {track.plays_count?.toLocaleString() || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" /> {track.likes_count?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No tracks uploaded yet</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setUploadModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Upload Your First Track
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Upload Track', icon: Upload, color: 'bg-red-500 hover:bg-red-600', onClick: () => setUploadModalOpen(true) },
          { label: 'Create NFT', icon: Disc, color: 'bg-purple-500 hover:bg-purple-600' },
          { label: 'View Analytics', icon: BarChart2, color: 'bg-blue-500 hover:bg-blue-600' },
          { label: 'Manage Merch', icon: Eye, color: 'bg-green-500 hover:bg-green-600' },
        ].map((action) => (
          <Button 
            key={action.label} 
            className={`${action.color} flex-col h-auto py-4`}
            onClick={action.onClick}
          >
            <action.icon className="w-5 h-5 mb-1" />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>

      {/* Upload Modal */}
      <UploadTrackModal 
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
