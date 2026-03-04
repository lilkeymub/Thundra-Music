import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Plus, Users, Hash, Lock, Search, 
  MoreVertical, Smile, Image, Mic, Phone, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ChatRoom {
  id: string;
  name: string;
  description: string | null;
  type: 'public' | 'private' | 'direct';
  cover_url: string | null;
  created_at: string;
}

interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

const defaultRooms: ChatRoom[] = [
  { id: 'general', name: 'General', description: 'General discussions', type: 'public', cover_url: null, created_at: '' },
  { id: 'music-talk', name: 'Music Talk', description: 'Discuss your favorite tracks', type: 'public', cover_url: null, created_at: '' },
  { id: 'artists-lounge', name: 'Artists Lounge', description: 'For verified artists', type: 'private', cover_url: null, created_at: '' },
];

export default function ChatSection() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<ChatRoom[]>(defaultRooms);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(defaultRooms[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setRooms([...defaultRooms, ...data as ChatRoom[]]);
      }
    };
    fetchRooms();
  }, []);

  // Fetch messages for selected room
  useEffect(() => {
    if (!selectedRoom || defaultRooms.find(r => r.id === selectedRoom.id)) {
      // For default rooms, use sample messages
      setMessages([
        { id: '1', room_id: selectedRoom?.id || '', user_id: 'system', content: 'Welcome to the chat! 🎵', message_type: 'system', created_at: new Date().toISOString(), username: 'Thundra Bot' },
        { id: '2', room_id: selectedRoom?.id || '', user_id: 'user1', content: 'Hey everyone! Loving the new tracks on here', message_type: 'text', created_at: new Date().toISOString(), username: 'MusicFan23' },
        { id: '3', room_id: selectedRoom?.id || '', user_id: 'user2', content: 'Has anyone checked out the new Afrobeats playlist?', message_type: 'text', created_at: new Date().toISOString(), username: 'AfroVibes' },
      ]);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', selectedRoom.id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (data) {
        // Fetch usernames
        const userIds = [...new Set(data.map(m => m.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        setMessages(data.map(m => ({
          ...m,
          username: profileMap.get(m.user_id)?.username || 'Anonymous',
          avatar_url: profileMap.get(m.user_id)?.avatar_url
        })));
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`room-${selectedRoom.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${selectedRoom.id}` },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();

          const newMsg = {
            ...payload.new as Message,
            username: profile?.username || 'Anonymous',
            avatar_url: profile?.avatar_url
          };
          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !user) return;

    // For demo rooms, just add locally
    if (defaultRooms.find(r => r.id === selectedRoom.id)) {
      const localMsg: Message = {
        id: Date.now().toString(),
        room_id: selectedRoom.id,
        user_id: user.id,
        content: newMessage,
        message_type: 'text',
        created_at: new Date().toISOString(),
        username: profile?.username || 'You',
        avatar_url: profile?.avatar_url || undefined
      };
      setMessages(prev => [...prev, localMsg]);
      setNewMessage('');
      return;
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        room_id: selectedRoom.id,
        user_id: user.id,
        content: newMessage.trim(),
        message_type: 'text'
      });

    if (error) {
      toast({ title: "Error", description: "Failed to send message", variant: "destructive" });
      return;
    }

    setNewMessage('');
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim() || !user) return;

    const { data, error } = await supabase
      .from('chat_rooms')
      .insert({
        name: newRoomName.trim(),
        description: newRoomDesc.trim() || null,
        type: 'public',
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create room", variant: "destructive" });
      return;
    }

    setRooms(prev => [data as ChatRoom, ...prev]);
    setSelectedRoom(data as ChatRoom);
    setShowNewRoom(false);
    setNewRoomName('');
    setNewRoomDesc('');
    toast({ title: "Room created!", description: `#${data.name} is ready` });
  };

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-12rem)] flex rounded-xl overflow-hidden border border-border">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Chat Spaces
            </h2>
            <Dialog open={showNewRoom} onOpenChange={setShowNewRoom}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Room</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Room Name</label>
                    <Input
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      placeholder="awesome-music-fans"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Description (optional)</label>
                    <Input
                      value={newRoomDesc}
                      onChange={(e) => setNewRoomDesc(e.target.value)}
                      placeholder="A place to discuss..."
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleCreateRoom} className="w-full">Create Room</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms..."
              className="pl-9"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                  selectedRoom?.id === room.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  selectedRoom?.id === room.id ? 'bg-primary-foreground/20' : 'bg-primary/20'
                }`}>
                  {room.type === 'private' ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Hash className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{room.name}</p>
                  <p className={`text-xs truncate ${
                    selectedRoom?.id === room.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {room.description || 'No description'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {profile?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.username || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Hash className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">{selectedRoom?.name}</h3>
              <p className="text-xs text-muted-foreground">{selectedRoom?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Phone className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Video className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <Users className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.message_type === 'system' ? 'justify-center' : ''}`}
                >
                  {msg.message_type === 'system' ? (
                    <div className="px-4 py-2 bg-secondary rounded-full text-sm text-muted-foreground">
                      {msg.content}
                    </div>
                  ) : (
                    <>
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarImage src={msg.avatar_url} />
                        <AvatarFallback className="bg-primary/20 text-primary text-sm">
                          {msg.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-sm">{msg.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm mt-0.5">{msg.content}</p>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Button type="button" size="icon" variant="ghost" className="h-10 w-10 flex-shrink-0">
              <Plus className="w-5 h-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message #${selectedRoom?.name}`}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" className="p-1.5 hover:bg-accent rounded">
                  <Smile className="w-4 h-4 text-muted-foreground" />
                </button>
                <button type="button" className="p-1.5 hover:bg-accent rounded">
                  <Image className="w-4 h-4 text-muted-foreground" />
                </button>
                <button type="button" className="p-1.5 hover:bg-accent rounded">
                  <Mic className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <Button type="submit" size="icon" className="h-10 w-10 flex-shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
