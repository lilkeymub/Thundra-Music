import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export function useLoginBonus() {
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);

  const claimBonus = useCallback(async () => {
    if (!user || claimed || loading) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('claim_login_bonus', {
        p_user_id: user.id
      });

      if (error) {
        console.error('Error claiming bonus:', error);
        return;
      }

      if (data === true) {
        setClaimed(true);
        await refreshProfile();
        toast({
          title: "🎉 Daily Bonus Claimed!",
          description: "You received 100 $THDR tokens!",
        });
      }
    } catch (error) {
      console.error('Error claiming bonus:', error);
    } finally {
      setLoading(false);
    }
  }, [user, claimed, loading, refreshProfile, toast]);

  useEffect(() => {
    if (user) {
      claimBonus();
    }
  }, [user, claimBonus]);

  return { claimed, loading };
}
