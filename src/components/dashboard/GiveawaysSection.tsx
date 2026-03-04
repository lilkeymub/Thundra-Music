import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Clock, Users, Trophy, Plus, Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

interface Giveaway {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  prize_type: string;
  prize_value: number | null;
  prize_description: string | null;
  max_entries: number | null;
  current_entries: number;
  ends_at: string;
  status: string;
  creator_name?: string;
  hasEntered?: boolean;
}

const sampleGiveaways: Giveaway[] = [
  {
    id: '1',
    creator_id: '1',
    title: '1000 THDR Giveaway',
    description: 'Win 1000 THDR tokens! Just enter and share.',
    prize_type: 'tokens',
    prize_value: 1000,
    prize_description: '1000 THDR tokens',
    max_entries: 500,
    current_entries: 234,
    ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    creator_name: 'Thundra Official'
  },
  {
    id: '2',
    creator_id: '2',
    title: 'VIP Subscription Giveaway',
    description: 'Win 3 months of VIP subscription!',
    prize_type: 'subscription',
    prize_value: null,
    prize_description: '3 months VIP',
    max_entries: 200,
    current_entries: 156,
    ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    creator_name: 'DJ Thunder'
  },
];

export default function GiveawaysSection() {
  const { user } = useAuth();
  const { isPremiumOrAbove } = useUserRole();
  const { toast } = useToast();
  const [giveaways, setGiveaways] = useState<Giveaway[]>(sampleGiveaways);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newGiveaway, setNewGiveaway] = useState({
    title: '',
    description: '',
    prize_type: 'tokens',
    prize_value: 100,
    prize_description: '',
    max_entries: 100,
    ends_at: ''
  });

  useEffect(() => {
    fetchGiveaways();
  }, [user]);

  const fetchGiveaways = async () => {
    const { data } = await supabase
      .from('giveaways')
      .select('*')
      .eq('status', 'active')
      .order('ends_at', { ascending: true });

    if (data) {
      // Check user entries
      let userEntries: string[] = [];
      if (user) {
        const { data: entries } = await supabase
          .from('giveaway_entries')
          .select('giveaway_id')
          .eq('user_id', user.id);
        userEntries = entries?.map(e => e.giveaway_id) || [];
      }

      const creatorIds = [...new Set(data.map(g => g.creator_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', creatorIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.username]) || []);

      setGiveaways([
        ...sampleGiveaways.map(g => ({ ...g, hasEntered: userEntries.includes(g.id) })),
        ...data.map(g => ({
          ...g,
          creator_name: profileMap.get(g.creator_id) || 'Unknown',
          hasEntered: userEntries.includes(g.id)
        }))
      ]);
    }
  };

  const handleEnterGiveaway = async (giveawayId: string) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to enter', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('giveaway_entries').insert({
      giveaway_id: giveawayId,
      user_id: user.id
    });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'Already entered', description: 'You have already entered this giveaway', variant: 'destructive' });
      } else {
        toast({ title: 'Error', description: 'Failed to enter giveaway', variant: 'destructive' });
      }
      return;
    }

    // Update local state
    setGiveaways(prev => prev.map(g => 
      g.id === giveawayId 
        ? { ...g, hasEntered: true, current_entries: g.current_entries + 1 }
        : g
    ));

    toast({ title: 'Entered! 🎉', description: 'Good luck!' });
  };

  const handleCreateGiveaway = async () => {
    if (!user || !newGiveaway.title || !newGiveaway.ends_at) return;

    const { error } = await supabase.from('giveaways').insert({
      creator_id: user.id,
      title: newGiveaway.title,
      description: newGiveaway.description,
      prize_type: newGiveaway.prize_type,
      prize_value: newGiveaway.prize_value,
      prize_description: newGiveaway.prize_description,
      max_entries: newGiveaway.max_entries,
      ends_at: new Date(newGiveaway.ends_at).toISOString()
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create giveaway', variant: 'destructive' });
      return;
    }

    toast({ title: 'Giveaway Created!', description: 'Your giveaway is now live' });
    setCreateModalOpen(false);
    fetchGiveaways();
  };

  const getTimeRemaining = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Gift className="w-6 h-6 text-primary" />
            Giveaways
          </h2>
          <p className="text-muted-foreground">Enter to win amazing prizes</p>
        </div>
        {isPremiumOrAbove && (
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Giveaway
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {giveaways.map((giveaway) => (
          <motion.div
            key={giveaway.id}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-6 rounded-xl space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">{giveaway.title}</h3>
                  <p className="text-sm text-muted-foreground">by {giveaway.creator_name}</p>
                </div>
              </div>
              <Badge variant={giveaway.status === 'active' ? 'default' : 'secondary'}>
                <Clock className="w-3 h-3 mr-1" />
                {getTimeRemaining(giveaway.ends_at)}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{giveaway.description}</p>

            <div className="p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">Prize: {giveaway.prize_description}</span>
              </div>
              {giveaway.prize_value && (
                <p className="text-2xl font-bold text-primary">{giveaway.prize_value} THDR</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {giveaway.current_entries} entries
                </span>
                {giveaway.max_entries && (
                  <span>{giveaway.max_entries - giveaway.current_entries} spots left</span>
                )}
              </div>
              {giveaway.max_entries && (
                <Progress value={(giveaway.current_entries / giveaway.max_entries) * 100} />
              )}
            </div>

            <Button
              onClick={() => handleEnterGiveaway(giveaway.id)}
              className="w-full"
              disabled={giveaway.hasEntered || giveaway.status !== 'active'}
              variant={giveaway.hasEntered ? 'outline' : 'default'}
            >
              {giveaway.hasEntered ? (
                <>
                  <Check className="w-4 h-4 mr-2" /> Entered
                </>
              ) : (
                <>
                  <Star className="w-4 h-4 mr-2" /> Enter Giveaway
                </>
              )}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Giveaway</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Title *</label>
              <Input
                value={newGiveaway.title}
                onChange={(e) => setNewGiveaway({ ...newGiveaway, title: e.target.value })}
                placeholder="1000 THDR Giveaway"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <Textarea
                value={newGiveaway.description}
                onChange={(e) => setNewGiveaway({ ...newGiveaway, description: e.target.value })}
                placeholder="Describe your giveaway..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Prize Value (THDR)</label>
                <Input
                  type="number"
                  value={newGiveaway.prize_value}
                  onChange={(e) => setNewGiveaway({ ...newGiveaway, prize_value: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Max Entries</label>
                <Input
                  type="number"
                  value={newGiveaway.max_entries}
                  onChange={(e) => setNewGiveaway({ ...newGiveaway, max_entries: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Ends At *</label>
              <Input
                type="datetime-local"
                value={newGiveaway.ends_at}
                onChange={(e) => setNewGiveaway({ ...newGiveaway, ends_at: e.target.value })}
              />
            </div>
            <Button onClick={handleCreateGiveaway} className="w-full">Create Giveaway</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
