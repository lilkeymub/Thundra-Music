import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TypingUser {
  user_id: string;
  username: string;
  timestamp: number;
}

export function useTypingIndicator(channelName: string, recipientId?: string) {
  const { user, profile } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!user || !channelName) return;

    // Create presence channel for typing indicators
    const channel = supabase.channel(`typing:${channelName}`, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const typing: TypingUser[] = [];
        
        Object.entries(presenceState).forEach(([userId, presence]) => {
          if (Array.isArray(presence) && presence.length > 0) {
            const p = presence[0] as any;
            if (p.typing && userId !== user.id) {
              typing.push({
                user_id: userId,
                username: p.username || 'User',
                timestamp: p.timestamp || Date.now()
              });
            }
          }
        });
        
        setTypingUsers(typing);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (key !== user.id) {
          const presence = newPresences[0] as any;
          if (presence?.typing) {
            setTypingUsers(prev => {
              if (prev.some(u => u.user_id === key)) return prev;
              return [...prev, {
                user_id: key,
                username: presence.username || 'User',
                timestamp: Date.now()
              }];
            });
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setTypingUsers(prev => prev.filter(u => u.user_id !== key));
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, channelName]);

  const startTyping = useCallback(() => {
    if (!user || !channelRef.current) return;

    // Track presence with typing state
    channelRef.current.track({
      typing: true,
      username: profile?.username || 'User',
      timestamp: Date.now()
    });

    // Auto-stop typing after 3 seconds of inactivity
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [user, profile]);

  const stopTyping = useCallback(() => {
    if (!channelRef.current) return;

    channelRef.current.track({
      typing: false,
      username: profile?.username || 'User',
      timestamp: Date.now()
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [profile]);

  // Format typing indicator text
  const typingText = typingUsers.length === 0 
    ? null 
    : typingUsers.length === 1 
      ? `${typingUsers[0].username} is typing...`
      : typingUsers.length === 2 
        ? `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`
        : `${typingUsers.length} people are typing...`;

  return {
    typingUsers,
    typingText,
    startTyping,
    stopTyping,
    isAnyoneTyping: typingUsers.length > 0
  };
}
