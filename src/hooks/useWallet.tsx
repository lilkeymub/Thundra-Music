import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Wallet {
  wallet_address: string;
  thdr_balance: number;
  usdt_balance: number;
}

interface Transaction {
  id: string;
  from_user_id: string;
  to_user_id: string;
  transaction_type: string;
  token_symbol: string;
  amount: number;
  fee: number;
  status: string;
  created_at: string;
}

export function useWallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setWallet(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    const fetchWallet = async () => {
      const { data, error } = await supabase
        .from('user_wallets')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setWallet({
          wallet_address: data.wallet_address,
          thdr_balance: data.thdr_balance,
          usdt_balance: data.usdt_balance,
        });
      }

      const { data: txData } = await supabase
        .from('wallet_transactions')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txData) setTransactions(txData);
      setLoading(false);
    };

    fetchWallet();

    const channel = supabase
      .channel(`wallet-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_wallets',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        if (payload.new) {
          const d = payload.new as any;
          setWallet({
            wallet_address: d.wallet_address,
            thdr_balance: d.thdr_balance,
            usdt_balance: d.usdt_balance,
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const sendTokens = async (
    toIdentifier: string,
    amount: number,
    tokenSymbol: string,
    identifierType: 'username' | 'email' | 'wallet_address'
  ) => {
    if (!user || !wallet) return false;

    let toAddress: string | null = null;

    if (identifierType === 'wallet_address') {
      toAddress = toIdentifier;
    } else {
      const field = identifierType === 'username' ? 'username' : 'email';
      const { data } = await supabase
        .from('profiles')
        .select('web3_wallet_address')
        .eq(field, toIdentifier)
        .maybeSingle();
      toAddress = data?.web3_wallet_address || null;
    }

    if (!toAddress) {
      toast({ title: 'Recipient not found', variant: 'destructive' });
      return false;
    }

    try {
      // Send on-chain via edge function
      const { data, error } = await supabase.functions.invoke('blockchain', {
        body: {
          action: 'send_tokens',
          from_user_id: user.id,
          from_address: wallet.wallet_address,
          to_address: toAddress,
          amount,
          token: tokenSymbol,
        },
      });

      if (error) throw error;

      toast({
        title: 'Transfer successful',
        description: `Sent ${amount} ${tokenSymbol} on-chain. TX: ${data.tx_hash?.slice(0, 10)}...`,
      });

      // Sync balance
      await supabase.functions.invoke('blockchain', {
        body: { action: 'sync_balance', user_id: user.id, wallet_address: wallet.wallet_address },
      });

      return true;
    } catch (err: any) {
      toast({
        title: 'Transaction failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const convertTokens = async (
    fromToken: string,
    toToken: string,
    amount: number
  ): Promise<boolean> => {
    if (!user || !wallet) return false;

    // For conversion, we use treasury as intermediary
    // User sends fromToken to treasury, treasury sends toToken back
    const { data: prices } = await supabase.from('token_prices').select('*');
    const getTokenPrice = (symbol: string): number => {
      const found = prices?.find(p => p.token_symbol === symbol);
      if (found) return found.price_usd;
      if (symbol === 'USDT') return 1.00;
      if (symbol === 'THDR') return 0.001;
      return 0.50;
    };

    const fromPrice = getTokenPrice(fromToken);
    const toPrice = getTokenPrice(toToken);
    const feeRate = 0.003;
    const amountAfterFee = amount * (1 - feeRate);
    const outputAmount = (amountAfterFee * fromPrice) / toPrice;
    const fee = amount * feeRate;

    try {
      // Step 1: User sends fromToken to treasury
      const { error: sendError } = await supabase.functions.invoke('blockchain', {
        body: {
          action: 'send_tokens',
          from_user_id: user.id,
          from_address: wallet.wallet_address,
          to_address: '0x38bc74e79b6e7d66b594124a6ccc92cef0974404', // Treasury
          amount,
          token: fromToken,
        },
      });
      if (sendError) throw sendError;

      // Step 2: Treasury sends toToken to user
      const { error: receiveError } = await supabase.functions.invoke('blockchain', {
        body: {
          action: 'transfer_from_treasury',
          to_address: wallet.wallet_address,
          amount: outputAmount,
          token: toToken,
          description: 'conversion',
          user_id: user.id,
        },
      });
      if (receiveError) throw receiveError;

      // Step 3: Burn the fee on-chain
      await supabase.functions.invoke('blockchain', {
        body: {
          action: 'burn_tokens',
          amount: fee,
          burn_type: 'conversion_fee',
          source_activity: 'token_swap',
          user_id: user.id,
          token: fromToken,
        },
      });

      // Record fee
      await supabase.from('fee_collections').insert({
        activity_type: 'conversion',
        original_amount: amount,
        fee_amount: fee,
        token_symbol: fromToken,
        burned_amount: fee,
        partnership_pool_amount: 0,
      });

      await supabase.from('price_activities').insert([
        { activity_type: 'swap', token_symbol: fromToken, amount, direction: 'sell' },
        { activity_type: 'swap', token_symbol: toToken, amount: outputAmount, direction: 'buy' },
        { activity_type: 'burn', token_symbol: fromToken, amount: fee, direction: 'burn' },
      ]);

      // Sync balance
      await supabase.functions.invoke('blockchain', {
        body: { action: 'sync_balance', user_id: user.id, wallet_address: wallet.wallet_address },
      });

      toast({
        title: 'Conversion successful',
        description: `Converted ${amount.toFixed(4)} ${fromToken} to ${outputAmount.toFixed(4)} ${toToken} on-chain (0.3% fee burned)`,
      });

      return true;
    } catch (err: any) {
      toast({
        title: 'Conversion failed',
        description: err.message || 'Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { wallet, transactions, loading, sendTokens, convertTokens };
}
