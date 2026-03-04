import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Search, MoreVertical, Plus,
  Image as ImageIcon, Smile, Phone, Video, Flag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import ReportModal from './ReportModal';

interface Conversation {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export default function DMSection() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;

    // Get all DMs
    const { data: dms } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (!dms) return;

    // Group by conversation partner
    const convMap = new Map<string, { messages: Message[]; partnerId: string }>();
    
    dms.forEach(dm => {
      const partnerId = dm.sender_id === user.id ? dm.receiver_id : dm.sender_id;
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, { messages: [], partnerId });
      }
      convMap.get(partnerId)!.messages.push(dm);
    });

    // Get partner profiles
    const partnerIds = Array.from(convMap.keys());
    if (partnerIds.length === 0) return;

    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url')
      .in('user_id', partnerIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    const convs: Conversation[] = partnerIds.map(partnerId => {
      const data = convMap.get(partnerId)!;
      const partner = profileMap.get(partnerId);
      const unread = data.messages.filter(m => m.receiver_id === user.id && !m.read).length;
      
      return {
        id: partnerId,
        user_id: partnerId,
        username: partner?.username || 'Unknown',
        avatar_url: partner?.avatar_url,
        last_message: data.messages[0]?.content || '',
        last_message_at: data.messages[0]?.created_at || '',
        unread_count: unread
      };
    });

    setConversations(convs.sort((a, b) => 
      new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
    ));
  };

  const fetchMessages = async (partnerId: string) => {
    if (!user) return;

    const { data } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);

      // Mark as read
      await supabase
        .from('direct_messages')
        .update({ read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', user.id);
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConv(conv);
    fetchMessages(conv.user_id);
  };

  const handleSendMessage = async () => {
    if (!user || !selectedConv || !newMessage.trim()) return;

    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: user.id,
        receiver_id: selectedConv.user_id,
        content: newMessage.trim()
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
      return;
    }

    setMessages(prev => [...prev, data]);
    setNewMessage('');

    // Update conversation
    setConversations(prev => prev.map(c => 
      c.user_id === selectedConv.user_id 
        ? { ...c, last_message: newMessage, last_message_at: new Date().toISOString() }
        : c
    ));
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url')
      .ilike('username', `%${query}%`)
      .neq('user_id', user?.id)
      .limit(5);

    setSearchResults(data || []);
  };

  const startConversation = (partner: any) => {
    const existingConv = conversations.find(c => c.user_id === partner.user_id);
    if (existingConv) {
      handleSelectConversation(existingConv);
    } else {
      setSelectedConv({
        id: partner.user_id,
        user_id: partner.user_id,
        username: partner.username,
        avatar_url: partner.avatar_url,
        last_message: '',
        last_message_at: '',
        unread_count: 0
      });
      setMessages([]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return date.toLocaleDateString();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Please sign in to view your messages
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex rounded-xl overflow-hidden border border-border">
      {/* Conversations List */}
      <div className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-display font-bold flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-primary" />
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-9"
            />
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-2 bg-secondary rounded-lg overflow-hidden">
              {searchResults.map(u => (
                <button
                  key={u.user_id}
                  onClick={() => startConversation(u)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={u.avatar_url} />
                    <AvatarFallback>{u.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{u.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  selectedConv?.user_id === conv.user_id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
              >
                <div className="relative">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={conv.avatar_url || undefined} />
                    <AvatarFallback>{conv.username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {conv.unread_count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-sm truncate">{conv.username}</p>
                  <p className={`text-xs truncate ${
                    selectedConv?.user_id === conv.user_id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {conv.last_message}
                  </p>
                </div>
                <span className={`text-xs ${
                  selectedConv?.user_id === conv.user_id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                }`}>
                  {formatTime(conv.last_message_at)}
                </span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConv.avatar_url || undefined} />
                  <AvatarFallback>{selectedConv.username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{selectedConv.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost"><Phone className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost"><Video className="w-4 h-4" /></Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost"><MoreVertical className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setReportModalOpen(true)} className="text-destructive">
                      <Flag className="w-4 h-4 mr-2" /> Report User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                      msg.sender_id === user.id
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-secondary rounded-bl-md'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender_id === user.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Button type="button" size="icon" variant="ghost"><ImageIcon className="w-5 h-5" /></Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${selectedConv.username}`}
                  className="flex-1"
                />
                <Button type="button" size="icon" variant="ghost"><Smile className="w-5 h-5" /></Button>
                <Button type="submit" size="icon"><Send className="w-4 h-4" /></Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm">or search for someone to message</p>
            </div>
          </div>
        )}
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        contentType="user"
        contentId={selectedConv?.user_id || ''}
      />
    </div>
  );
}
