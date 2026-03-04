import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const FREE_PLAY_LIMIT = 5;
const SESSION_KEY = 'thundra_session_id';

function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function usePlayLimit() {
  const { user, profile } = useAuth();
  const [playsToday, setPlaysToday] = useState(0);
  const [loading, setLoading] = useState(true);

  const isPremiumUser = profile?.tier && ['premium', 'vip', 'artist', 'moderator', 'staff', 'admin'].includes(profile.tier);

  const fetchPlays = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      if (user) {
        const { data } = await supabase
          .from('daily_plays')
          .select('plays_count')
          .eq('user_id', user.id)
          .eq('play_date', today)
          .maybeSingle();
        
        setPlaysToday(data?.plays_count || 0);
      } else {
        const sessionId = getSessionId();
        const { data } = await supabase
          .from('daily_plays')
          .select('plays_count')
          .eq('session_id', sessionId)
          .eq('play_date', today)
          .maybeSingle();
        
        setPlaysToday(data?.plays_count || 0);
      }
    } catch (error) {
      console.error('Error fetching plays:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPlays();
  }, [fetchPlays]);

  const canPlay = useCallback((): boolean => {
    if (isPremiumUser) return true;
    return playsToday < FREE_PLAY_LIMIT;
  }, [isPremiumUser, playsToday]);

  const recordPlay = useCallback(async (): Promise<boolean> => {
    if (isPremiumUser) return true;
    if (playsToday >= FREE_PLAY_LIMIT) return false;

    const today = new Date().toISOString().split('T')[0];

    try {
      if (user) {
        const { data: existing } = await supabase
          .from('daily_plays')
          .select('id, plays_count')
          .eq('user_id', user.id)
          .eq('play_date', today)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('daily_plays')
            .update({ plays_count: existing.plays_count + 1 })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('daily_plays')
            .insert({ user_id: user.id, play_date: today, plays_count: 1 });
        }
      } else {
        const sessionId = getSessionId();
        const { data: existing } = await supabase
          .from('daily_plays')
          .select('id, plays_count')
          .eq('session_id', sessionId)
          .eq('play_date', today)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('daily_plays')
            .update({ plays_count: existing.plays_count + 1 })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('daily_plays')
            .insert({ session_id: sessionId, play_date: today, plays_count: 1 });
        }
      }

      setPlaysToday(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error recording play:', error);
      return false;
    }
  }, [user, playsToday, isPremiumUser]);

  const remainingPlays = isPremiumUser ? Infinity : Math.max(0, FREE_PLAY_LIMIT - playsToday);

  return {
    playsToday,
    remainingPlays,
    canPlay,
    recordPlay,
    loading,
    isPremiumUser,
    FREE_PLAY_LIMIT
  };
}
