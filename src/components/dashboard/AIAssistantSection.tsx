import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, Plus, Trash2, Music, Mic, Search, 
  Loader2, Bot, User, Copy, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const suggestedPrompts = [
  { icon: Music, text: "Recommend me some Afrobeats songs" },
  { icon: Search, text: "Find artists similar to Burna Boy" },
  { icon: Mic, text: "What are the trending tracks this week?" },
  { icon: Sparkles, text: "Create a chill playlist for studying" },
];

export default function AIAssistantSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    
    const fetchConversations = async () => {
      const { data } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (data) {
        setConversations(data);
        if (data.length > 0 && !currentConversation) {
          setCurrentConversation(data[0].id);
        }
      }
    };
    fetchConversations();
  }, [user]);

  // Fetch messages for current conversation
  useEffect(() => {
    if (!currentConversation) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', currentConversation)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data as Message[]);
      }
    };
    fetchMessages();
  }, [currentConversation]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const createNewConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ user_id: user.id, title: 'New Chat' })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
      return;
    }

    setConversations(prev => [data, ...prev]);
    setCurrentConversation(data.id);
    setMessages([]);
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete conversation", variant: "destructive" });
      return;
    }

    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversation === id) {
      setCurrentConversation(conversations.find(c => c.id !== id)?.id || null);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !user || loading) return;

    let conversationId = currentConversation;

    // Create new conversation if needed
    if (!conversationId) {
      const { data: newConv, error } = await supabase
        .from('ai_conversations')
        .insert({ user_id: user.id, title: content.slice(0, 50) })
        .select()
        .single();

      if (error) {
        toast({ title: "Error", description: "Failed to create conversation", variant: "destructive" });
        return;
      }

      conversationId = newConv.id;
      setCurrentConversation(conversationId);
      setConversations(prev => [newConv, ...prev]);
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Save user message to DB
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content
    });

    try {
      // Call Lovable AI Gateway
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_LOVABLE_API_KEY || ''}`
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: `You are Thundra AI, a helpful music assistant for the Thundra Music platform. 
              You help users discover music, create playlists, learn about artists, and get personalized recommendations.
              Be friendly, knowledgeable about all music genres (especially Afrobeats, Hip Hop, R&B, Electronic), 
              and enthusiastic about helping users explore new music. Keep responses concise but helpful.
              When recommending songs, format them as bullet points with artist - song title.`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content }
          ],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();
      const aiContent = data.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);

      // Save AI message to DB
      await supabase.from('ai_messages').insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: aiContent
      });

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        await supabase
          .from('ai_conversations')
          .update({ title: content.slice(0, 50), updated_at: new Date().toISOString() })
          .eq('id', conversationId);

        setConversations(prev => prev.map(c => 
          c.id === conversationId ? { ...c, title: content.slice(0, 50) } : c
        ));
      }
    } catch (error) {
      console.error('AI error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment!",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Message copied to clipboard" });
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex rounded-xl overflow-hidden border border-border">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col hidden md:flex">
        <div className="p-4 border-b border-border">
          <Button onClick={createNewConversation} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  currentConversation === conv.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                }`}
                onClick={() => setCurrentConversation(conv.id)}
              >
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate text-sm">{conv.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-background">
        {/* Header */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Thundra AI</h3>
              <p className="text-xs text-muted-foreground">Your music discovery assistant</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="md:hidden" onClick={createNewConversation}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-2">Hi! I'm Thundra AI</h3>
              <p className="text-muted-foreground mb-8 max-w-md">
                I can help you discover new music, create playlists, find similar artists, and answer questions about the music world.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt.text)}
                    className="flex items-center gap-3 p-4 bg-secondary hover:bg-secondary/80 rounded-xl text-left transition-colors"
                  >
                    <prompt.icon className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                      <div className={`p-4 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-br-sm' 
                          : 'bg-secondary rounded-bl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center gap-2 mt-1 pl-2">
                          <button 
                            onClick={() => copyToClipboard(msg.content)}
                            className="p-1 hover:bg-accent rounded text-muted-foreground"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 hover:bg-accent rounded text-muted-foreground">
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 hover:bg-accent rounded text-muted-foreground">
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 order-2">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="p-4 bg-secondary rounded-2xl rounded-bl-sm">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-border">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about music..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Thundra AI can make mistakes. Consider checking important information.
          </p>
        </form>
      </div>
    </div>
  );
}
