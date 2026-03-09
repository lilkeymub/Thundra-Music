import { useState, useEffect, useRef, useCallback } from 'react';
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
  const priceFluctuationInterval = useRef<NodeJS.Timeout | null>(null);

  const addMicroFluctuation = useCallback(() => {
    setPrices(prev => prev.map(price => {
      if (price.token_symbol === 'USDT') return price;
      
      const fluctuation = (Math.random() - 0.5) * 0.006;
      const newPrice = price.price_usd * (1 + fluctuation);
      const baseChange = price.price_change_24h || 0;
      const microChange = fluctuation * 100;
      
      return {
        ...price,
        price_usd: Math.max(0.001, newPrice),
        price_change_24h: baseChange + (microChange * 0.1),
        last_updated: new Date().toISOString()
      };
    }));
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      const { data, error } = await supabase
        .from('token_prices')
        .select('*');

      if (!error && data && data.length > 0) {
        const filtered = data;
        setPrices(filtered);
      } else {
        setPrices([
          { token_symbol: 'THDR', price_usd: 0.001, price_change_24h: 0, last_updated: new Date().toISOString() },
          { token_symbol: 'USDT', price_usd: 1.00, price_change_24h: 0, last_updated: new Date().toISOString() }
        ]);
      }
      setLoading(false);
    };

    fetchPrices();

    const channel = supabase
      .channel('token-prices-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_prices'
        },
        (payload) => {
          if (payload.new) {
            const newPrice = payload.new as TokenPrice;
            setPrices(prev => {
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

    priceFluctuationInterval.current = setInterval(() => {
      addMicroFluctuation();
    }, 5000 + Math.random() * 5000);

    return () => {
      supabase.removeChannel(channel);
      if (priceFluctuationInterval.current) {
        clearInterval(priceFluctuationInterval.current);
      }
    };
  }, [addMicroFluctuation]);

  const getPrice = (symbol: string): number => {
    const token = prices.find(p => p.token_symbol === symbol);
    if (token) return token.price_usd;
    if (symbol === 'USDT') return 1.00;
    if (symbol === 'THDR') return 0.001;
    return 0;
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
