import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useActiveUsers() {
  const { user } = useAuth();
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track current user session
    const trackSession = async () => {
      if (user) {
        const sessionToken = `session_${user.id}_${Date.now()}`;
        
        // Clean up old sessions first
        await supabase
          .from('active_sessions')
          .delete()
          .eq('user_id', user.id);

        // Insert new session
        await supabase
          .from('active_sessions')
          .insert({
            user_id: user.id,
            session_token: sessionToken,
            last_active: new Date().toISOString()
          });
      }
    };

    trackSession();

    // Fetch active user count
    const fetchActiveCount = async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { count, error } = await supabase
        .from('active_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('last_active', fiveMinutesAgo);

      if (!error && count !== null) {
        setActiveCount(count);
      }
      setLoading(false);
    };

    fetchActiveCount();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('active-sessions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'active_sessions'
        },
        () => {
          fetchActiveCount();
        }
      )
      .subscribe();

    // Update last_active periodically
    const interval = setInterval(async () => {
      if (user) {
        await supabase
          .from('active_sessions')
          .update({ last_active: new Date().toISOString() })
          .eq('user_id', user.id);
      }
      fetchActiveCount();
    }, 60000); // Every minute

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [user]);

  return {
    activeCount,
    loading,
  };
}
