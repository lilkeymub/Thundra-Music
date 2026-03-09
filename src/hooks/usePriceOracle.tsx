import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TokenPrice {
  token_symbol: string;
  price_usd: number;
  price_change_24h: number;
  last_updated: string;
}

interface LiquidityPool {
  id: string;
  pool_name: string;
  token_a: string;
  token_b: string;
  reserve_a: number;
  reserve_b: number;
  fee_rate: number;
}

export function usePriceOracle() {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [pools, setPools] = useState<LiquidityPool[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    // Fetch token prices
    const { data: priceData } = await supabase
      .from('token_prices')
      .select('*');

    if (priceData) {
      setPrices(priceData);
    }

    // Fetch liquidity pools
    const { data: poolData } = await supabase
      .from('liquidity_pools')
      .select('*');

    if (poolData) {
      setPools(poolData);
    }

    setLoading(false);
  }, []);

  // Trigger the price oracle edge function periodically
  const triggerPriceUpdate = useCallback(async () => {
    try {
      await supabase.functions.invoke('price-oracle', { method: 'POST' });
    } catch (error) {
      console.error('Price oracle update failed:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Initial price update
    triggerPriceUpdate();

    // Set up interval for continuous price updates (every 10 seconds)
    const priceUpdateInterval = setInterval(() => {
      triggerPriceUpdate();
    }, 10000);

    // Subscribe to real-time price updates
    const priceChannel = supabase
      .channel('token-prices-oracle')
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

    // Subscribe to liquidity pool updates
    const poolChannel = supabase
      .channel('liquidity-pools-oracle')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'liquidity_pools'
        },
        (payload) => {
          if (payload.new) {
            setPools(prev => {
              const newPool = payload.new as LiquidityPool;
              const existing = prev.findIndex(p => p.id === newPool.id);
              if (existing >= 0) {
                const updated = [...prev];
                updated[existing] = newPool;
                return updated;
              }
              return [...prev, newPool];
            });
          }
        }
      )
      .subscribe();

    return () => {
      clearInterval(priceUpdateInterval);
      supabase.removeChannel(priceChannel);
      supabase.removeChannel(poolChannel);
    };
  }, [fetchData, triggerPriceUpdate]);

  const getPrice = (symbol: string): number => {
    const token = prices.find(p => p.token_symbol === symbol);
    if (token) return token.price_usd;
    // Default prices synced with ecosystem targets
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

  const getPool = (tokenA: string, tokenB: string): LiquidityPool | null => {
    return pools.find(p => 
      (p.token_a === tokenA && p.token_b === tokenB) ||
      (p.token_a === tokenB && p.token_b === tokenA)
    ) || null;
  };

  return {
    prices,
    pools,
    loading,
    getPrice,
    getChange,
    formatUsd,
    getPool,
    triggerPriceUpdate,
  };
}
