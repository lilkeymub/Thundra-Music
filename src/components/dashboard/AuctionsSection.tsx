import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gavel, Clock, TrendingUp, Plus, Trophy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Auction {
  id: string;
  seller_id: string;
  item_type: string;
  item_id: string;
  starting_price: number;
  current_bid: number | null;
  current_bidder_id: string | null;
  reserve_price: number | null;
  ends_at: string;
  status: string;
  seller_name?: string;
  item_title?: string;
  item_image?: string;
}

const sampleAuctions: Auction[] = [
  {
    id: '1',
    seller_id: '1',
    item_type: 'nft',
    item_id: '1',
    starting_price: 100,
    current_bid: 250,
    current_bidder_id: '2',
    reserve_price: 500,
    ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    seller_name: 'Neon Pulse',
    item_title: 'Rare Beat Collection #001',
    item_image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'
  },
  {
    id: '2',
    seller_id: '2',
    item_type: 'nft',
    item_id: '2',
    starting_price: 50,
    current_bid: 75,
    current_bidder_id: '3',
    reserve_price: null,
    ends_at: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    seller_name: 'African Beats',
    item_title: 'Exclusive Afro Sample Pack',
    item_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'
  },
];

export default function AuctionsSection() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [auctions, setAuctions] = useState<Auction[]>(sampleAuctions);
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [bidAmount, setBidAmount] = useState('');

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    const { data } = await supabase
      .from('auctions')
      .select('*')
      .eq('status', 'active')
      .order('ends_at', { ascending: true });

    if (data && data.length > 0) {
      setAuctions([...sampleAuctions, ...data]);
    }
  };

  const handlePlaceBid = async () => {
    if (!user || !selectedAuction) return;

    const bid = parseFloat(bidAmount);
    const minBid = (selectedAuction.current_bid || selectedAuction.starting_price) + 1;

    if (bid < minBid) {
      toast({ title: 'Bid too low', description: `Minimum bid is ${minBid} THDR`, variant: 'destructive' });
      return;
    }

    if ((profile?.thdr_balance || 0) < bid) {
      toast({ title: 'Insufficient balance', description: 'You need more THDR', variant: 'destructive' });
      return;
    }

    // Place bid
    const { error } = await supabase.from('auction_bids').insert({
      auction_id: selectedAuction.id,
      bidder_id: user.id,
      bid_amount: bid
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to place bid', variant: 'destructive' });
      return;
    }

    // Update auction
    await supabase.from('auctions').update({
      current_bid: bid,
      current_bidder_id: user.id
    }).eq('id', selectedAuction.id);

    setAuctions(prev => prev.map(a => 
      a.id === selectedAuction.id 
        ? { ...a, current_bid: bid, current_bidder_id: user.id }
        : a
    ));

    toast({ title: 'Bid Placed! 🎉', description: `You bid ${bid} THDR` });
    setSelectedAuction(null);
    setBidAmount('');
  };

  const getTimeRemaining = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Gavel className="w-6 h-6 text-primary" />
            Auctions
          </h2>
          <p className="text-muted-foreground">Bid on exclusive items</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {auctions.map((auction) => (
          <motion.div
            key={auction.id}
            whileHover={{ y: -5 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <div className="relative h-48">
              <img
                src={auction.item_image || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400'}
                alt={auction.item_title}
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-3 right-3 bg-red-500">
                <Clock className="w-3 h-3 mr-1" />
                {getTimeRemaining(auction.ends_at)}
              </Badge>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-bold text-lg">{auction.item_title}</h3>
                <p className="text-sm text-muted-foreground">by {auction.seller_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Current Bid</p>
                  <p className="text-xl font-bold text-primary">
                    {auction.current_bid || auction.starting_price} THDR
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Starting</p>
                  <p className="text-sm">{auction.starting_price} THDR</p>
                </div>
              </div>

              {auction.reserve_price && (
                <p className="text-xs text-muted-foreground">
                  Reserve: {(auction.current_bid || 0) >= auction.reserve_price ? '✅ Met' : '❌ Not met'}
                </p>
              )}

              <Button 
                onClick={() => setSelectedAuction(auction)} 
                className="w-full"
                disabled={auction.status !== 'active'}
              >
                <Gavel className="w-4 h-4 mr-2" /> Place Bid
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bid Modal */}
      <Dialog open={!!selectedAuction} onOpenChange={() => setSelectedAuction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place a Bid</DialogTitle>
          </DialogHeader>
          {selectedAuction && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <img
                  src={selectedAuction.item_image}
                  alt={selectedAuction.item_title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-bold">{selectedAuction.item_title}</h3>
                  <p className="text-sm text-muted-foreground">by {selectedAuction.seller_name}</p>
                  <p className="text-lg font-bold text-primary mt-2">
                    Current: {selectedAuction.current_bid || selectedAuction.starting_price} THDR
                  </p>
                </div>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <p className="text-sm mb-2">
                  Minimum bid: {(selectedAuction.current_bid || selectedAuction.starting_price) + 1} THDR
                </p>
                <Input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Enter your bid"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                Your balance: {profile?.thdr_balance || 0} THDR
              </p>

              <Button onClick={handlePlaceBid} className="w-full" size="lg">
                Place Bid
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
