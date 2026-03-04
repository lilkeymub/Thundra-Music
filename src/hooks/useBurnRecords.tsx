import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BurnRecord {
  id: string;
  token_symbol: string;
  amount: number;
  burn_type: string;
  source_activity: string;
  burned_at: string;
}

export function useBurnRecords() {
  const [totalBurned, setTotalBurned] = useState(0);
  const [recentBurns, setRecentBurns] = useState<BurnRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBurnRecords = async () => {
      // Get total burned
      const { data, error } = await supabase
        .from('burn_records')
        .select('*')
        .eq('token_symbol', 'THDR')
        .order('burned_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        const total = data.reduce((sum, record) => sum + Number(record.amount), 0);
        setTotalBurned(total);
        setRecentBurns(data.slice(0, 10));
      }
      setLoading(false);
    };

    fetchBurnRecords();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('burn-records')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'burn_records'
        },
        (payload) => {
          if (payload.new) {
            const newBurn = payload.new as BurnRecord;
            if (newBurn.token_symbol === 'THDR') {
              setTotalBurned(prev => prev + Number(newBurn.amount));
              setRecentBurns(prev => [newBurn, ...prev.slice(0, 9)]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatBurned = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toFixed(0);
  };

  return {
    totalBurned,
    recentBurns,
    loading,
    formatBurned,
  };
}
