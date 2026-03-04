import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Search, Filter, Grid, List, Play, Heart, 
  Verified, TrendingUp, Plus, Music, Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useToast } from '@/hooks/use-toast';

interface NFTListing {
  id: string;
  title: string;
  description: string | null;
  artist_id: string;
  cover_url: string;
  audio_url: string | null;
  price: number;
  currency: string;
  total_supply: number;
  remaining_supply: number;
  category: string;
  artist_name?: string;
}

const categories = ['All', 'Music', 'Beats', 'Albums', 'Singles', 'Exclusive'];

const sampleNFTs: NFTListing[] = [
  { id: '1', title: 'Genesis Beat #001', description: 'First edition beat', artist_id: '1', cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', audio_url: null, price: 50, currency: 'THDR', total_supply: 100, remaining_supply: 87, category: 'Beats', artist_name: 'Neon Pulse' },
  { id: '2', title: 'Afro Vibes Collection', description: 'Exclusive afrobeats pack', artist_id: '2', cover_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400', audio_url: null, price: 120, currency: 'THDR', total_supply: 50, remaining_supply: 23, category: 'Albums', artist_name: 'African Beats' },
  { id: '3', title: 'Midnight Session', description: 'Limited R&B single', artist_id: '3', cover_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400', audio_url: null, price: 25, currency: 'THDR', total_supply: 500, remaining_supply: 342, category: 'Singles', artist_name: 'Luna Wave' },
  { id: '4', title: 'Electronic Dreams Pack', description: 'EDM sample collection', artist_id: '4', cover_url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400', audio_url: null, price: 80, currency: 'THDR', total_supply: 200, remaining_supply: 156, category: 'Beats', artist_name: 'DJ Thunder' },
  { id: '5', title: 'Rare Vinyl Drop', description: '1 of 1 exclusive', artist_id: '5', cover_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400', audio_url: null, price: 500, currency: 'THDR', total_supply: 1, remaining_supply: 1, category: 'Exclusive', artist_name: 'Mystic Soul' },
  { id: '6', title: 'City Nights Album', description: 'Full hip-hop album', artist_id: '6', cover_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=400', audio_url: null, price: 150, currency: 'THDR', total_supply: 75, remaining_supply: 48, category: 'Albums', artist_name: 'Metro Sound' },
];

export default function MarketplaceSection() {
  const { user, profile } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { toast } = useToast();
  const [listings, setListings] = useState<NFTListing[]>(sampleNFTs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedNFT, setSelectedNFT] = useState<NFTListing | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  // Fetch real listings
  useEffect(() => {
    const fetchListings = async () => {
      const { data } = await supabase
        .from('nft_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        // Fetch artist names
        const artistIds = [...new Set(data.map(l => l.artist_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username')
          .in('user_id', artistIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.username]) || []);
        
        const listingsWithArtists = data.map(l => ({
          ...l,
          artist_name: profileMap.get(l.artist_id) || 'Unknown Artist'
        }));

        setListings([...sampleNFTs, ...listingsWithArtists]);
      }
    };
    fetchListings();
  }, []);

  const filteredListings = listings.filter(nft => {
    const matchesSearch = nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          nft.artist_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || nft.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = async () => {
    if (!user) {
      openAuthModal({ mode: 'login', message: 'Sign in to purchase NFTs' });
      return;
    }

    if (!selectedNFT) return;

    const userBalance = profile?.thdr_balance || 0;
    
    if (userBalance < selectedNFT.price) {
      toast({ 
        title: "Insufficient balance", 
        description: `You need ${selectedNFT.price} THDR but only have ${userBalance.toFixed(2)} THDR.`, 
        variant: "destructive" 
      });
      return;
    }

    setPurchasing(true);
    try {
      // Deduct from buyer's balance first
      const newBalance = userBalance - selectedNFT.price;
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ thdr_balance: newBalance })
        .eq('user_id', user.id);

      if (deductError) {
        toast({ title: "Transaction failed", description: "Could not process payment", variant: "destructive" });
        setPurchasing(false);
        return;
      }

      // Add to seller's balance
      const { data: sellerProfile } = await supabase
        .from('profiles')
        .select('thdr_balance, web3_wallet_address, email')
        .eq('user_id', selectedNFT.artist_id)
        .single();

      if (sellerProfile) {
        const platformFee = selectedNFT.price * 0.10;
        const sellerAmount = selectedNFT.price - platformFee;
        
        await supabase
          .from('profiles')
          .update({ thdr_balance: (sellerProfile.thdr_balance || 0) + sellerAmount })
          .eq('user_id', selectedNFT.artist_id);
      }

      // Record purchase
      await supabase
        .from('nft_purchases')
        .insert({
          listing_id: selectedNFT.id,
          buyer_id: user.id,
          seller_id: selectedNFT.artist_id,
          price: selectedNFT.price,
          currency: selectedNFT.currency
        });

      // Record transaction in ledger
      const { data: txn } = await supabase.from('transactions_ledger').insert({
        transaction_type: 'purchase',
        from_user_id: user.id,
        from_wallet_address: profile?.web3_wallet_address,
        from_email: profile?.email,
        to_user_id: selectedNFT.artist_id,
        to_wallet_address: sellerProfile?.web3_wallet_address,
        to_email: sellerProfile?.email,
        amount: selectedNFT.price,
        token_symbol: 'THDR',
        fee_amount: selectedNFT.price * 0.10,
        status: 'completed',
        description: `NFT Purchase: ${selectedNFT.title}`,
      }).select().single();

      // Create notifications with explorer link
      await supabase.from('notifications').insert([
        {
          user_id: user.id,
          type: 'transaction',
          title: 'NFT Purchased! 🎉',
          message: `You purchased ${selectedNFT.title} for ${selectedNFT.price} THDR`,
          data: { transaction_hash: (txn as any)?.transaction_hash, explorer_link: `/explorer?txn=${(txn as any)?.transaction_hash}` }
        },
        {
          user_id: selectedNFT.artist_id,
          type: 'transaction',
          title: 'NFT Sold! 💰',
          message: `Your NFT ${selectedNFT.title} was sold for ${selectedNFT.price} THDR`,
          data: { transaction_hash: (txn as any)?.transaction_hash, explorer_link: `/explorer?txn=${(txn as any)?.transaction_hash}` }
        }
      ]);

      // Record burn
      const burnAmount = selectedNFT.price * 0.05;
      await supabase.from('burn_records').insert({
        token_symbol: 'THDR',
        amount: burnAmount,
        burn_type: 'marketplace_fee',
        source_activity: 'nft_purchase',
      });

      toast({ title: "Purchase successful! 🎉", description: `You now own ${selectedNFT.title}` });
      setSelectedNFT(null);
    } catch (error) {
      console.error('Purchase error:', error);
      toast({ title: "Error", description: "Failed to complete purchase", variant: "destructive" });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            NFT Marketplace
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Collect exclusive music NFTs from your favorite artists
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search NFTs..."
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

      {/* Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Volume', value: '125,430 THDR', icon: TrendingUp },
          { label: 'NFTs Listed', value: listings.length.toString(), icon: ImageIcon },
          { label: 'Artists', value: '48', icon: Music },
          { label: 'Collectors', value: '1,234', icon: Heart },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-4 rounded-xl"
          >
            <stat.icon className="w-5 h-5 text-primary mb-2" />
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* NFT Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredListings.map((nft) => (
            <motion.div
              key={nft.id}
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-xl overflow-hidden group cursor-pointer"
              onClick={() => setSelectedNFT(nft)}
            >
              <div className="relative aspect-square">
                <img src={nft.cover_url} alt={nft.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white font-bold truncate">{nft.title}</p>
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <span>{nft.artist_name}</span>
                    <Verified className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
                {nft.remaining_supply === 1 && (
                  <div className="absolute top-3 right-3 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full font-medium">
                    1 of 1
                  </div>
                )}
                <button className="absolute top-3 left-3 p-2 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-bold text-primary">{nft.price} THDR</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="font-medium">{nft.remaining_supply}/{nft.total_supply}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredListings.map((nft) => (
            <motion.div
              key={nft.id}
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-4 p-4 glass-card rounded-xl cursor-pointer"
              onClick={() => setSelectedNFT(nft)}
            >
              <img src={nft.cover_url} alt={nft.title} className="w-16 h-16 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{nft.title}</p>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <span>{nft.artist_name}</span>
                  <Verified className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <div className="text-center hidden sm:block">
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm">{nft.category}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Remaining</p>
                <p className="text-sm">{nft.remaining_supply}/{nft.total_supply}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">{nft.price} THDR</p>
              </div>
              <Button size="sm">Buy Now</Button>
            </motion.div>
          ))}
        </div>
      )}

      {/* NFT Detail Modal */}
      <Dialog open={!!selectedNFT} onOpenChange={() => setSelectedNFT(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Purchase NFT</DialogTitle>
          </DialogHeader>
          {selectedNFT && (
            <div className="space-y-4">
              <div className="aspect-square rounded-xl overflow-hidden">
                <img src={selectedNFT.cover_url} alt={selectedNFT.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{selectedNFT.title}</h3>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span>by {selectedNFT.artist_name}</span>
                  <Verified className="w-4 h-4 text-primary" />
                </div>
                {selectedNFT.description && (
                  <p className="text-sm text-muted-foreground mt-2">{selectedNFT.description}</p>
                )}
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold text-primary">{selectedNFT.price} THDR</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-xl font-bold">{selectedNFT.remaining_supply}/{selectedNFT.total_supply}</p>
                </div>
              </div>
              {user && (
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm">Your balance: <span className="font-bold">{profile?.thdr_balance || 0} THDR</span></p>
                </div>
              )}
              <Button 
                onClick={handlePurchase} 
                className="w-full" 
                size="lg"
                disabled={purchasing}
              >
                {purchasing ? 'Processing...' : `Buy for ${selectedNFT.price} THDR`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
