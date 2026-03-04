import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Wallet {
  wallet_address: string;
  thdr_balance: number;
  usdt_balance: number;
  ion_balance: number;
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
        setWallet(data);
      }

      // Fetch transactions
      const { data: txData } = await supabase
        .from('wallet_transactions')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (txData) {
        setTransactions(txData);
      }

      setLoading(false);
    };

    fetchWallet();
  }, [user]);

  const sendTokens = async (
    toIdentifier: string,
    amount: number,
    tokenSymbol: string,
    identifierType: 'username' | 'email' | 'wallet_address'
  ) => {
    if (!user || !wallet) return false;

    // Find recipient
    let recipientId: string | null = null;

    if (identifierType === 'wallet_address') {
      const { data } = await supabase
        .from('user_wallets')
        .select('user_id')
        .eq('wallet_address', toIdentifier)
        .maybeSingle();
      recipientId = data?.user_id || null;
    } else if (identifierType === 'username') {
      const { data } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', toIdentifier)
        .maybeSingle();
      recipientId = data?.user_id || null;
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', toIdentifier)
        .maybeSingle();
      recipientId = data?.user_id || null;
    }

    if (!recipientId) {
      toast({
        title: 'Recipient not found',
        description: 'Please check the identifier and try again.',
        variant: 'destructive',
      });
      return false;
    }

    // Check balance
    const balanceKey = `${tokenSymbol.toLowerCase()}_balance` as keyof Wallet;
    const currentBalance = Number(wallet[balanceKey]) || 0;

    if (currentBalance < amount) {
      toast({
        title: 'Insufficient balance',
        description: `You don't have enough ${tokenSymbol} to complete this transaction.`,
        variant: 'destructive',
      });
      return false;
    }

    // Perform transfer
    const { error: deductError } = await supabase
      .from('user_wallets')
      .update({ [balanceKey]: currentBalance - amount })
      .eq('user_id', user.id);

    if (deductError) {
      toast({
        title: 'Transaction failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return false;
    }

    // Add to recipient
    const { data: recipientWallet } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', recipientId)
      .maybeSingle();

    if (recipientWallet) {
      const recipientBalance = Number(recipientWallet[balanceKey]) || 0;
      await supabase
        .from('user_wallets')
        .update({ [balanceKey]: recipientBalance + amount })
        .eq('user_id', recipientId);
    }

    // Record transaction
    await supabase.from('wallet_transactions').insert({
      from_user_id: user.id,
      to_user_id: recipientId,
      transaction_type: 'transfer',
      token_symbol: tokenSymbol,
      amount,
      fee: 0,
      status: 'completed',
    });

    toast({
      title: 'Transfer successful',
      description: `Sent ${amount} ${tokenSymbol} successfully.`,
    });

    // Refresh wallet
    const { data: updatedWallet } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (updatedWallet) {
      setWallet(updatedWallet);
    }

    return true;
  };

  const convertTokens = async (
    fromToken: string,
    toToken: string,
    amount: number
  ) => {
    if (!user || !wallet) return false;

    // Try different pool name combinations
    const poolNames = [
      [fromToken, toToken].sort().join('_'),
      `${fromToken}_${toToken}`,
      `${toToken}_${fromToken}`
    ];

    let pool = null;
    for (const poolName of poolNames) {
      const { data } = await supabase
        .from('liquidity_pools')
        .select('*')
        .eq('pool_name', poolName)
        .maybeSingle();
      
      if (data) {
        pool = data;
        break;
      }
    }

    if (!pool) {
      toast({
        title: 'Pool not found',
        description: 'This trading pair is not available.',
        variant: 'destructive',
      });
      return false;
    }

    // Check balance
    const fromBalanceKey = `${fromToken.toLowerCase()}_balance` as keyof Wallet;
    const toBalanceKey = `${toToken.toLowerCase()}_balance` as keyof Wallet;
    const currentFromBalance = Number(wallet[fromBalanceKey]) || 0;

    if (currentFromBalance < amount) {
      toast({
        title: 'Insufficient balance',
        description: `You don't have enough ${fromToken}.`,
        variant: 'destructive',
      });
      return false;
    }

    // Calculate output using constant product formula (x * y = k)
    const reserveFrom = pool.token_a === fromToken ? Number(pool.reserve_a) : Number(pool.reserve_b);
    const reserveTo = pool.token_a === toToken ? Number(pool.reserve_a) : Number(pool.reserve_b);
    
    const amountWithFee = amount * (1 - Number(pool.fee_rate));
    const outputAmount = (amountWithFee * reserveTo) / (reserveFrom + amountWithFee);

    // Update balances
    const { error } = await supabase
      .from('user_wallets')
      .update({
        [fromBalanceKey]: currentFromBalance - amount,
        [toBalanceKey]: (Number(wallet[toBalanceKey]) || 0) + outputAmount,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: 'Conversion failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      return false;
    }

    // Update liquidity pool
    const newReserveFrom = reserveFrom + amount;
    const newReserveTo = reserveTo - outputAmount;

    await supabase
      .from('liquidity_pools')
      .update({
        reserve_a: pool.token_a === fromToken ? newReserveFrom : newReserveTo,
        reserve_b: pool.token_b === fromToken ? newReserveFrom : newReserveTo,
      })
      .eq('id', pool.id);

    // Record fee and burn
    const fee = amount * Number(pool.fee_rate);
    await supabase.from('fee_collections').insert({
      activity_type: 'conversion',
      original_amount: amount,
      fee_amount: fee,
      token_symbol: fromToken,
      burned_amount: fee,
      partnership_pool_amount: 0,
    });

    await supabase.from('burn_records').insert({
      token_symbol: fromToken,
      amount: fee,
      burn_type: 'conversion_fee',
      source_activity: 'token_swap',
    });

    // Record price activity to affect token prices (table created dynamically)
    await supabase.from('price_activities' as any).insert([
      { activity_type: 'swap', token_symbol: fromToken, amount, direction: 'sell' },
      { activity_type: 'swap', token_symbol: toToken, amount: outputAmount, direction: 'buy' },
      { activity_type: 'burn', token_symbol: 'THDR', amount: fee, direction: 'burn' }
    ] as any);

    toast({
      title: 'Conversion successful',
      description: `Converted ${amount} ${fromToken} to ${outputAmount.toFixed(4)} ${toToken}.`,
    });

    // Refresh wallet
    const { data: updatedWallet } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (updatedWallet) {
      setWallet(updatedWallet);
    }

    return true;
  };

  return {
    wallet,
    transactions,
    loading,
    sendTokens,
    convertTokens,
  };
}
