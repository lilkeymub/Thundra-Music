import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, Users, Music, DollarSign, Shield, TrendingUp,
  CheckCircle, XCircle, Eye, Settings, BarChart, Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  artist_name?: string;
  genre?: string;
  motivation?: string;
  username?: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [artistApps, setArtistApps] = useState<Application[]>([]);
  const [modApps, setModApps] = useState<Application[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTracks: 0,
    totalBurned: 0,
    activeSubscriptions: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fetch artist applications
      const { data: artistData } = await supabase
        .from('artist_applications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (artistData) {
        // Get usernames
        const userIds = artistData.map(a => a.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.username]) || []);
        setArtistApps(artistData.map(a => ({ ...a, username: profileMap.get(a.user_id) })));
      }

      // Fetch moderator applications
      const { data: modData } = await supabase
        .from('moderator_applications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (modData) {
        const userIds = modData.map(a => a.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.username]) || []);
        setModApps(modData.map(a => ({ ...a, username: profileMap.get(a.user_id) })));
      }

      // Fetch stats
      const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: tracksCount } = await supabase.from('tracks').select('*', { count: 'exact', head: true });
      const { data: burnData } = await supabase.from('burn_records').select('amount').eq('token_symbol', 'THDR');
      const { count: subsCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: usersCount || 0,
        totalTracks: tracksCount || 0,
        totalBurned: burnData?.reduce((sum, b) => sum + Number(b.amount), 0) || 0,
        activeSubscriptions: subsCount || 0,
      });
    };

    fetchData();
  }, []);

  const handleApproveArtist = async (appId: string) => {
    if (!user) return;

    const { data, error } = await supabase.rpc('approve_artist_application', {
      p_application_id: appId,
      p_admin_id: user.id
    });

    if (error || !data) {
      toast({ title: "Error", description: "Failed to approve application", variant: "destructive" });
      return;
    }

    setArtistApps(prev => prev.filter(a => a.id !== appId));
    toast({ title: "Approved!", description: "Artist application approved successfully" });
  };

  const handleApproveModerator = async (appId: string) => {
    if (!user) return;

    const { data, error } = await supabase.rpc('approve_moderator_application', {
      p_application_id: appId,
      p_admin_id: user.id
    });

    if (error || !data) {
      toast({ title: "Error", description: "Failed to approve application", variant: "destructive" });
      return;
    }

    setModApps(prev => prev.filter(a => a.id !== appId));
    toast({ title: "Approved!", description: "Moderator application approved successfully" });
  };

  const handleReject = async (appId: string, type: 'artist' | 'moderator') => {
    const table = type === 'artist' ? 'artist_applications' : 'moderator_applications';
    
    const { error } = await supabase
      .from(table)
      .update({ status: 'rejected', reviewed_by: user?.id, reviewed_at: new Date().toISOString() })
      .eq('id', appId);

    if (error) {
      toast({ title: "Error", description: "Failed to reject application", variant: "destructive" });
      return;
    }

    if (type === 'artist') {
      setArtistApps(prev => prev.filter(a => a.id !== appId));
    } else {
      setModApps(prev => prev.filter(a => a.id !== appId));
    }
    toast({ title: "Rejected", description: "Application has been rejected" });
  };

  const platformStats = [
    { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Tracks', value: stats.totalTracks.toLocaleString(), icon: Music, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'THDR Burned', value: stats.totalBurned.toLocaleString(), icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Subscriptions', value: stats.activeSubscriptions.toLocaleString(), icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">Platform management and oversight</p>
        </div>
        <Badge className="bg-yellow-500 text-black">
          <Crown className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {platformStats.map((stat, i) => (
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
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Applications Tabs */}
      <Tabs defaultValue="artists" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="artists" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Artist Applications ({artistApps.length})
          </TabsTrigger>
          <TabsTrigger value="moderators" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Moderator Applications ({modApps.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="artists" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Artist Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {artistApps.length > 0 ? (
                <div className="space-y-4">
                  {artistApps.map((app) => (
                    <div key={app.id} className="p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold">{app.artist_name}</p>
                            <span className="text-sm text-muted-foreground">@{app.username}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">Genre: {app.genre}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveArtist(app.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleReject(app.id, 'artist')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50 text-green-500" />
                  <p>No pending artist applications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderators" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Moderator Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {modApps.length > 0 ? (
                <div className="space-y-4">
                  {modApps.map((app) => (
                    <div key={app.id} className="p-4 bg-secondary/50 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold">@{app.username}</p>
                          <p className="text-sm text-muted-foreground mt-1">{app.motivation}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Applied {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproveModerator(app.id)}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleReject(app.id, 'moderator')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50 text-green-500" />
                  <p>No pending moderator applications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'User Management', icon: Users, color: 'bg-blue-500 hover:bg-blue-600' },
          { label: 'Content Review', icon: Eye, color: 'bg-purple-500 hover:bg-purple-600' },
          { label: 'Analytics', icon: BarChart, color: 'bg-green-500 hover:bg-green-600' },
          { label: 'Settings', icon: Settings, color: 'bg-gray-500 hover:bg-gray-600' },
        ].map((action) => (
          <Button key={action.label} className={`${action.color} flex-col h-auto py-4`}>
            <action.icon className="w-5 h-5 mb-1" />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
