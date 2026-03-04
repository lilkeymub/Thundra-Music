import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TokenPrice {
  token_symbol: string;
  price_usd: number;
  price_change_24h: number;
  last_updated: string;
}

export function useTokenPrices() {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      const { data, error } = await supabase
        .from('token_prices')
        .select('*');

      if (!error && data) {
        setPrices(data);
      }
      setLoading(false);
    };

    fetchPrices();

    // Subscribe to real-time price updates
    const channel = supabase
      .channel('token-prices')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_prices'
        },
        (payload) => {
          if (payload.new) {
            setPrices(prev => {
              const newPrice = payload.new as TokenPrice;
              const existing = prev.findIndex(p => p.token_symbol === newPrice.token_symbol);
              if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = newPrice;
                return updated;
              }
              return [...prev, newPrice];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getPrice = (symbol: string): number => {
    const token = prices.find(p => p.token_symbol === symbol);
    return token?.price_usd || 0;
  };

  const getChange = (symbol: string): number => {
    const token = prices.find(p => p.token_symbol === symbol);
    return token?.price_change_24h || 0;
  };

  const formatUsd = (amount: number, symbol: string): string => {
    const price = getPrice(symbol);
    return `$${(amount * price).toFixed(2)}`;
  };

  return {
    prices,
    loading,
    getPrice,
    getChange,
    formatUsd,
  };
}
