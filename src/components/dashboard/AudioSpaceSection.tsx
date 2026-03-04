import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Radio, Mic, MicOff, Users, Plus, Play, Pause, 
  Volume2, Hand, Settings, PhoneOff, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface AudioSpace {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  is_live: boolean;
  started_at: string | null;
  scheduled_at: string | null;
  max_participants: number;
  host_name?: string;
  host_avatar?: string;
  participant_count?: number;
}

interface Participant {
  id: string;
  user_id: string;
  role: string;
  username?: string;
  avatar_url?: string;
}

const sampleSpaces: AudioSpace[] = [
  {
    id: '1',
    host_id: '1',
    title: 'Music Production Tips',
    description: 'Live discussion about music production',
    is_live: true,
    started_at: new Date().toISOString(),
    scheduled_at: null,
    max_participants: 100,
    host_name: 'DJ Thunder',
    host_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
    participant_count: 45
  },
  {
    id: '2',
    host_id: '2',
    title: 'Web3 Music Future',
    description: 'Discussing blockchain in music industry',
    is_live: false,
    started_at: null,
    scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    max_participants: 50,
    host_name: 'Crypto Luna',
    participant_count: 0
  },
];

export default function AudioSpaceSection() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<AudioSpace[]>(sampleSpaces);
  const [activeSpace, setActiveSpace] = useState<AudioSpace | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSpace, setNewSpace] = useState({ title: '', description: '' });

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    const { data } = await supabase
      .from('audio_spaces')
      .select('*')
      .order('is_live', { ascending: false });

    if (data && data.length > 0) {
      const hostIds = [...new Set(data.map(s => s.host_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', hostIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      setSpaces([
        ...sampleSpaces,
        ...data.map(s => ({
          ...s,
          host_name: profileMap.get(s.host_id)?.username || 'Unknown',
          host_avatar: profileMap.get(s.host_id)?.avatar_url
        }))
      ]);
    }
  };

  const handleJoinSpace = async (space: AudioSpace) => {
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to join', variant: 'destructive' });
      return;
    }

    setActiveSpace(space);

    // Add as participant
    await supabase.from('audio_space_participants').insert({
      space_id: space.id,
      user_id: user.id,
      role: 'listener'
    });

    // Simulate participants
    setParticipants([
      { id: '1', user_id: space.host_id, role: 'host', username: space.host_name, avatar_url: space.host_avatar },
      { id: '2', user_id: '2', role: 'speaker', username: 'Luna Wave' },
      { id: '3', user_id: '3', role: 'listener', username: 'Music Fan' },
      { id: '4', user_id: user.id, role: 'listener', username: profile?.username || 'You' },
    ]);

    toast({ title: 'Joined Space! 🎙️', description: `You're now in "${space.title}"` });
  };

  const handleLeaveSpace = async () => {
    if (activeSpace && user) {
      await supabase.from('audio_space_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('space_id', activeSpace.id)
        .eq('user_id', user.id);
    }
    setActiveSpace(null);
    setParticipants([]);
    setIsMuted(true);
  };

  const handleCreateSpace = async () => {
    if (!user || !newSpace.title) return;

    const { data, error } = await supabase.from('audio_spaces').insert({
      host_id: user.id,
      title: newSpace.title,
      description: newSpace.description,
      is_live: true,
      started_at: new Date().toISOString()
    }).select().single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to create space', variant: 'destructive' });
      return;
    }

    toast({ title: 'Space Created!', description: 'You are now live' });
    setCreateModalOpen(false);
    setActiveSpace({ ...data, host_name: profile?.username, participant_count: 1 });
    setParticipants([{ id: '1', user_id: user.id, role: 'host', username: profile?.username }]);
    setNewSpace({ title: '', description: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Radio className="w-6 h-6 text-primary" />
            Audio Spaces
          </h2>
          <p className="text-muted-foreground">Live audio rooms and discussions</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Start Space
        </Button>
      </div>

      {/* Active Space */}
      {activeSpace && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-xl border-2 border-primary"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <Badge className="bg-red-500 mb-2">
                <span className="animate-pulse mr-1">●</span> LIVE
              </Badge>
              <h3 className="text-xl font-bold">{activeSpace.title}</h3>
            </div>
            <Button variant="destructive" onClick={handleLeaveSpace}>
              <PhoneOff className="w-4 h-4 mr-2" /> Leave
            </Button>
          </div>

          {/* Participants Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-6">
            {participants.map((p) => (
              <div key={p.id} className="flex flex-col items-center">
                <div className="relative">
                  <Avatar className={`w-14 h-14 ${p.role === 'speaker' ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                    <AvatarImage src={p.avatar_url} />
                    <AvatarFallback>{p.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {p.role === 'host' && (
                    <Crown className="absolute -top-2 -right-2 w-5 h-5 text-yellow-500" />
                  )}
                  {p.role === 'speaker' && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Mic className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-xs mt-1 truncate max-w-[60px]">{p.username}</p>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              size="lg"
              variant={isMuted ? 'outline' : 'default'}
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-full w-14 h-14"
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            <Button size="lg" variant="outline" className="rounded-full w-14 h-14">
              <Hand className="w-6 h-6" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Available Spaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {spaces.filter(s => s.id !== activeSpace?.id).map((space) => (
          <motion.div
            key={space.id}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-4 rounded-xl cursor-pointer"
            onClick={() => space.is_live && handleJoinSpace(space)}
          >
            <div className="flex items-start gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={space.host_avatar} />
                <AvatarFallback>{space.host_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {space.is_live ? (
                    <Badge className="bg-red-500">
                      <span className="animate-pulse mr-1">●</span> LIVE
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Scheduled</Badge>
                  )}
                </div>
                <h3 className="font-semibold">{space.title}</h3>
                <p className="text-sm text-muted-foreground">{space.host_name}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {space.participant_count || 0}
                  </span>
                  {!space.is_live && space.scheduled_at && (
                    <span>Starts {new Date(space.scheduled_at).toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
              {space.is_live && (
                <Button size="sm">Join</Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Audio Space</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Title *</label>
              <Input
                value={newSpace.title}
                onChange={(e) => setNewSpace({ ...newSpace, title: e.target.value })}
                placeholder="What's this space about?"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Description</label>
              <Input
                value={newSpace.description}
                onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <Button onClick={handleCreateSpace} className="w-full">
              <Radio className="w-4 h-4 mr-2" /> Go Live
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
