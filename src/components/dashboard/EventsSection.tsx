import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, MapPin, Users, Ticket, Plus, Clock, 
  ExternalLink, QrCode, Share2, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  location: string | null;
  is_virtual: boolean;
  starts_at: string;
  ends_at: string | null;
  max_attendees: number | null;
  event_type: string;
  organizer_id: string;
  organizer_name?: string;
  ticket_price?: number;
}

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Afrobeats Night Live',
    description: 'Experience the best of African music with top artists',
    cover_url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600',
    location: 'Lagos, Nigeria',
    is_virtual: false,
    starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: null,
    max_attendees: 5000,
    event_type: 'concert',
    organizer_id: '1',
    organizer_name: 'Thundra Events',
    ticket_price: 50
  },
  {
    id: '2',
    title: 'Web3 Music Summit',
    description: 'Virtual conference on blockchain in music',
    cover_url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600',
    location: 'Online',
    is_virtual: true,
    starts_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    ends_at: null,
    max_attendees: 1000,
    event_type: 'conference',
    organizer_id: '2',
    organizer_name: 'Crypto Music DAO',
    ticket_price: 25
  },
];

export default function EventsSection() {
  const { user, profile } = useAuth();
  const { isArtist } = useUserRole();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>(sampleEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'virtual' | 'physical'>('all');

  // Form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    is_virtual: false,
    starts_at: '',
    event_type: 'concert',
    max_attendees: 100,
    ticket_price: 0
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('starts_at', { ascending: true });

    if (data && data.length > 0) {
      const organizerIds = [...new Set(data.map(e => e.organizer_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username')
        .in('user_id', organizerIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.username]) || []);

      setEvents([
        ...sampleEvents,
        ...data.map(e => ({
          ...e,
          organizer_name: profileMap.get(e.organizer_id) || 'Unknown'
        }))
      ]);
    }
  };

  const handleCreateEvent = async () => {
    if (!user || !newEvent.title || !newEvent.starts_at) return;

    const { error } = await supabase.from('events').insert({
      organizer_id: user.id,
      title: newEvent.title,
      description: newEvent.description,
      location: newEvent.location,
      is_virtual: newEvent.is_virtual,
      starts_at: new Date(newEvent.starts_at).toISOString(),
      event_type: newEvent.event_type,
      max_attendees: newEvent.max_attendees
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create event', variant: 'destructive' });
      return;
    }

    toast({ title: 'Event Created!', description: 'Your event is now live' });
    setCreateModalOpen(false);
    fetchEvents();
  };

  const handlePurchaseTicket = async () => {
    if (!user || !selectedEvent) return;

    const price = selectedEvent.ticket_price || 0;
    const userBalance = profile?.thdr_balance || 0;
    
    if (userBalance < price) {
      toast({ 
        title: 'Insufficient Balance', 
        description: `You need ${price} THDR but have ${userBalance.toFixed(2)} THDR`, 
        variant: 'destructive' 
      });
      return;
    }

    // Deduct balance first
    const { error: deductError } = await supabase.from('profiles').update({
      thdr_balance: userBalance - price
    }).eq('user_id', user.id);

    if (deductError) {
      toast({ title: 'Transaction Failed', description: 'Could not process payment', variant: 'destructive' });
      return;
    }

    // Add to organizer if price > 0
    if (price > 0) {
      const platformFee = price * 0.10;
      const organizerAmount = price - platformFee;

      const { data: organizerProfile } = await supabase
        .from('profiles')
        .select('thdr_balance, web3_wallet_address, email')
        .eq('user_id', selectedEvent.organizer_id)
        .single();

      if (organizerProfile) {
        await supabase
          .from('profiles')
          .update({ thdr_balance: (organizerProfile.thdr_balance || 0) + organizerAmount })
          .eq('user_id', selectedEvent.organizer_id);
      }

      // Record transaction in ledger
      const { data: txn } = await supabase.from('transactions_ledger').insert({
        transaction_type: 'purchase',
        from_user_id: user.id,
        from_wallet_address: profile?.web3_wallet_address,
        from_email: profile?.email,
        to_user_id: selectedEvent.organizer_id,
        to_wallet_address: organizerProfile?.web3_wallet_address,
        to_email: organizerProfile?.email,
        amount: price,
        token_symbol: 'THDR',
        fee_amount: platformFee,
        status: 'completed',
        description: `Event Ticket: ${selectedEvent.title}`,
      }).select().single();

      // Create notifications
      await supabase.from('notifications').insert([
        {
          user_id: user.id,
          type: 'transaction',
          title: 'Ticket Purchased! 🎫',
          message: `You purchased a ticket for ${selectedEvent.title}`,
          data: { transaction_hash: (txn as any)?.transaction_hash, explorer_link: `/explorer?txn=${(txn as any)?.transaction_hash}` }
        },
        {
          user_id: selectedEvent.organizer_id,
          type: 'transaction',
          title: 'Ticket Sold! 💰',
          message: `Someone purchased a ticket for ${selectedEvent.title}`,
          data: { transaction_hash: (txn as any)?.transaction_hash, explorer_link: `/explorer?txn=${(txn as any)?.transaction_hash}` }
        }
      ]);

      // Record burn
      await supabase.from('burn_records').insert({
        token_symbol: 'THDR',
        amount: platformFee * 0.5,
        burn_type: 'event_fee',
        source_activity: 'ticket_purchase',
      });
    }

    // Generate QR code
    const qrCode = `THDR-${selectedEvent.id}-${user.id}-${Date.now()}`;

    toast({ 
      title: 'Ticket Purchased! 🎫', 
      description: `Your QR code: ${qrCode.slice(0, 20)}...` 
    });
    setPurchaseModalOpen(false);
  };

  const filteredEvents = events.filter(e => {
    if (filter === 'virtual') return e.is_virtual;
    if (filter === 'physical') return !e.is_virtual;
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            Events & Concerts
          </h2>
          <p className="text-muted-foreground">Discover live shows and virtual events</p>
        </div>
        {isArtist && (
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Event
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'physical', 'virtual'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === 'all' ? 'All Events' : f}
          </Button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <motion.div
            key={event.id}
            whileHover={{ y: -5 }}
            className="glass-card rounded-xl overflow-hidden group cursor-pointer"
            onClick={() => {
              setSelectedEvent(event);
              setPurchaseModalOpen(true);
            }}
          >
            <div className="relative h-48">
              <img
                src={event.cover_url || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <Badge className="absolute top-3 right-3" variant={event.is_virtual ? 'secondary' : 'default'}>
                {event.is_virtual ? '🌐 Virtual' : '📍 Live'}
              </Badge>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-white font-bold text-lg">{event.title}</h3>
                <p className="text-white/80 text-sm">{event.organizer_name}</p>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(event.starts_at)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.location || 'Online'}
                </span>
                {event.max_attendees && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {event.max_attendees} spots
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-lg font-bold text-primary">
                  {event.ticket_price ? `${event.ticket_price} THDR` : 'Free'}
                </span>
                <Button size="sm">
                  <Ticket className="w-4 h-4 mr-1" /> Get Ticket
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Purchase Modal */}
      <Dialog open={purchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Ticket</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <img
                src={selectedEvent.cover_url || ''}
                alt={selectedEvent.title}
                className="w-full h-40 object-cover rounded-lg"
              />
              <h3 className="text-xl font-bold">{selectedEvent.title}</h3>
              <p className="text-muted-foreground">{selectedEvent.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formatDate(selectedEvent.starts_at)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {selectedEvent.location || 'Online'}
                </div>
              </div>

              <div className="p-4 bg-secondary rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Ticket Price</span>
                  <span className="font-bold">{selectedEvent.ticket_price || 0} THDR</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Your Balance</span>
                  <span>{profile?.thdr_balance || 0} THDR</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <QrCode className="w-5 h-5 text-primary" />
                <span className="text-sm">You'll receive a QR code ticket after purchase</span>
              </div>

              <Button onClick={handlePurchaseTicket} className="w-full" size="lg">
                Purchase for {selectedEvent.ticket_price || 0} THDR
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Event Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Event Title *</label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="My Amazing Concert"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Tell people about your event..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Date & Time *</label>
                <Input
                  type="datetime-local"
                  value={newEvent.starts_at}
                  onChange={(e) => setNewEvent({ ...newEvent, starts_at: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Event Type</label>
                <Select
                  value={newEvent.event_type}
                  onValueChange={(v) => setNewEvent({ ...newEvent, event_type: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concert">Concert</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Location</label>
              <Input
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="City, Venue or 'Online'"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Max Attendees</label>
                <Input
                  type="number"
                  value={newEvent.max_attendees}
                  onChange={(e) => setNewEvent({ ...newEvent, max_attendees: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Ticket Price (THDR)</label>
                <Input
                  type="number"
                  value={newEvent.ticket_price}
                  onChange={(e) => setNewEvent({ ...newEvent, ticket_price: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <Button onClick={handleCreateEvent} className="w-full">Create Event</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
