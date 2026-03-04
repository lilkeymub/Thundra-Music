import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone, Plus, BarChart3, Eye, MousePointer, DollarSign,
  Play, Pause, Edit2, Trash2, Image as ImageIcon, Video, Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string;
  ad_type: 'banner' | 'video' | 'audio' | 'sponsored';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  is_active: boolean;
  starts_at: string;
  ends_at: string | null;
}

const sampleAds: Ad[] = [
  { id: '1', title: 'Premium Subscription', description: 'Get unlimited streaming', image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', link_url: '/premium', ad_type: 'banner', budget: 1000, spent: 450, impressions: 12500, clicks: 320, is_active: true, starts_at: new Date().toISOString(), ends_at: null },
  { id: '2', title: 'New Artist Spotlight', description: 'Discover emerging talent', image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', link_url: '/artists', ad_type: 'sponsored', budget: 500, spent: 280, impressions: 8900, clicks: 156, is_active: true, starts_at: new Date().toISOString(), ends_at: null },
  { id: '3', title: 'NFT Drop Alert', description: 'Limited edition music NFTs', image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', link_url: '/marketplace', ad_type: 'banner', budget: 2000, spent: 1200, impressions: 25000, clicks: 890, is_active: false, starts_at: new Date().toISOString(), ends_at: null },
];

export default function AdsSection() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>(sampleAds);
  const [showCreateAd, setShowCreateAd] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [creating, setCreating] = useState(false);

  // Form state
  const [newAd, setNewAd] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    ad_type: 'banner' as const,
    budget: 100
  });

  // Fetch user's ads
  useEffect(() => {
    if (!user) return;

    const fetchAds = async () => {
      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('advertiser_id', user.id)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setAds([...sampleAds, ...data as Ad[]]);
      }
    };
    fetchAds();
  }, [user]);

  const totalStats = {
    impressions: ads.reduce((sum, ad) => sum + ad.impressions, 0),
    clicks: ads.reduce((sum, ad) => sum + ad.clicks, 0),
    spent: ads.reduce((sum, ad) => sum + ad.spent, 0),
    budget: ads.reduce((sum, ad) => sum + ad.budget, 0),
  };

  const ctr = totalStats.impressions > 0 
    ? ((totalStats.clicks / totalStats.impressions) * 100).toFixed(2) 
    : '0.00';

  const handleCreateAd = async () => {
    if (!user || !newAd.title || !newAd.image_url || !newAd.link_url) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const userBalance = profile?.thdr_balance || 0;
    if (userBalance < newAd.budget) {
      toast({ 
        title: "Insufficient balance", 
        description: `You need ${newAd.budget} THDR but have ${userBalance.toFixed(2)} THDR`, 
        variant: "destructive" 
      });
      return;
    }

    setCreating(true);
    try {
      // Deduct budget from balance first
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ thdr_balance: userBalance - newAd.budget })
        .eq('user_id', user.id);

      if (deductError) {
        toast({ title: "Transaction failed", description: "Could not process payment", variant: "destructive" });
        setCreating(false);
        return;
      }

      const { data, error } = await supabase
        .from('ads')
        .insert({
          advertiser_id: user.id,
          title: newAd.title,
          description: newAd.description || null,
          image_url: newAd.image_url,
          link_url: newAd.link_url,
          ad_type: newAd.ad_type,
          budget: newAd.budget,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Record transaction in ledger
      const { data: txn } = await supabase.from('transactions_ledger').insert({
        transaction_type: 'purchase',
        from_user_id: user.id,
        from_wallet_address: profile?.web3_wallet_address,
        from_email: profile?.email,
        to_wallet_address: 'THDR_ADS_TREASURY',
        amount: newAd.budget,
        token_symbol: 'THDR',
        status: 'completed',
        description: `Ad Campaign: ${newAd.title}`,
      }).select().single();

      // Create notification with explorer link
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'transaction',
        title: 'Ad Campaign Created',
        message: `Your ad "${newAd.title}" is now live with ${newAd.budget} THDR budget`,
        data: { transaction_hash: (txn as any)?.transaction_hash, explorer_link: `/explorer?txn=${(txn as any)?.transaction_hash}` }
      });

      // Record burn (50% of ad spend gets burned)
      await supabase.from('burn_records').insert({
        token_symbol: 'THDR',
        amount: newAd.budget * 0.5,
        burn_type: 'ad_fee',
        source_activity: 'ad_campaign',
      });

      setAds(prev => [data as Ad, ...prev]);
      setShowCreateAd(false);
      setNewAd({ title: '', description: '', image_url: '', link_url: '', ad_type: 'banner', budget: 100 });
      toast({ title: "Ad created!", description: "Your ad campaign is now live" });
    } catch (error) {
      console.error('Error creating ad:', error);
      toast({ title: "Error", description: "Failed to create ad", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const toggleAdStatus = async (ad: Ad) => {
    const { error } = await supabase
      .from('ads')
      .update({ is_active: !ad.is_active })
      .eq('id', ad.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update ad status", variant: "destructive" });
      return;
    }

    setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: !a.is_active } : a));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Thundra Ads
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Promote your music, events, and products to our audience
          </p>
        </div>
        
        <Dialog open={showCreateAd} onOpenChange={setShowCreateAd}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Ad Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Ad Title *</label>
                <Input
                  value={newAd.title}
                  onChange={(e) => setNewAd(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Your ad headline"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newAd.description}
                  onChange={(e) => setNewAd(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your ad"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Image URL *</label>
                <Input
                  value={newAd.image_url}
                  onChange={(e) => setNewAd(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Link URL *</label>
                <Input
                  value={newAd.link_url}
                  onChange={(e) => setNewAd(prev => ({ ...prev, link_url: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ad Type</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {['banner', 'video', 'audio', 'sponsored'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewAd(prev => ({ ...prev, ad_type: type as any }))}
                      className={`p-2 rounded-lg text-xs capitalize ${
                        newAd.ad_type === type 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Budget (THDR) *</label>
                <Input
                  type="number"
                  value={newAd.budget}
                  onChange={(e) => setNewAd(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                  min={10}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your balance: {profile?.thdr_balance || 0} THDR
                </p>
              </div>
              <Button onClick={handleCreateAd} className="w-full" disabled={creating}>
                {creating ? 'Creating...' : 'Launch Campaign'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Impressions', value: totalStats.impressions.toLocaleString(), icon: Eye, color: 'text-blue-500' },
          { label: 'Total Clicks', value: totalStats.clicks.toLocaleString(), icon: MousePointer, color: 'text-green-500' },
          { label: 'Click Rate (CTR)', value: `${ctr}%`, icon: BarChart3, color: 'text-purple-500' },
          { label: 'Total Spent', value: `${totalStats.spent} THDR`, icon: DollarSign, color: 'text-primary' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-4 rounded-xl"
          >
            <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Active Campaigns */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-green-500" />
                Active Campaigns
              </h3>
              <div className="space-y-3">
                {ads.filter(a => a.is_active).slice(0, 3).map((ad) => (
                  <div key={ad.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                    <img src={ad.image_url} alt={ad.title} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ad.title}</p>
                      <p className="text-xs text-muted-foreground">{ad.impressions.toLocaleString()} impressions</p>
                    </div>
                    <span className="text-xs text-green-500 font-medium">Active</span>
                  </div>
                ))}
                {ads.filter(a => a.is_active).length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No active campaigns</p>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass-card p-6 rounded-xl">
              <h3 className="font-bold mb-4">Performance This Week</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Budget Used</span>
                    <span>{((totalStats.spent / totalStats.budget) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(totalStats.spent / totalStats.budget) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <p className="text-2xl font-bold text-green-500">+24%</p>
                    <p className="text-xs text-muted-foreground">Impressions Growth</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-500">+18%</p>
                    <p className="text-xs text-muted-foreground">Click Growth</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-6">
          <div className="space-y-4">
            {ads.map((ad) => (
              <motion.div
                key={ad.id}
                whileHover={{ scale: 1.01 }}
                className="flex items-center gap-4 p-4 glass-card rounded-xl"
              >
                <img src={ad.image_url} alt={ad.title} className="w-20 h-20 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold">{ad.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      ad.is_active ? 'bg-green-500/20 text-green-500' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {ad.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{ad.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {ad.impressions.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointer className="w-4 h-4" /> {ad.clicks.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" /> {ad.spent}/{ad.budget} THDR
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => toggleAdStatus(ad)}
                  >
                    {ad.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="glass-card p-8 rounded-xl text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">Detailed Analytics Coming Soon</h3>
            <p className="text-muted-foreground">
              Track your ad performance with detailed charts, audience insights, and conversion tracking.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
