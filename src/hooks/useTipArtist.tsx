import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useRewards } from './useRewards';

export function useTipArtist() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { processPlatformFee } = useRewards();
  const [loading, setLoading] = useState(false);

  const sendTip = async (
    artistId: string,
    amount: number,
    tokenSymbol: 'THDR' | 'ION' = 'THDR',
    message?: string
  ): Promise<boolean> => {
    if (!user || !profile) {
      toast({
        title: 'Error',
        description: 'Please sign in to send tips',
        variant: 'destructive',
      });
      return false;
    }

    const balance = tokenSymbol === 'THDR' ? profile.thdr_balance : profile.ion_balance;
    if (amount > balance) {
      toast({
        title: 'Insufficient Balance',
        description: `You don't have enough ${tokenSymbol}`,
        variant: 'destructive',
      });
      return false;
    }

    setLoading(true);
    try {
      // Calculate platform fee (5% for tips)
      const feeRate = 0.05;
      const fee = amount * feeRate;
      const artistReceives = amount - fee;

      const balanceField = tokenSymbol === 'THDR' ? 'thdr_balance' : 'ion_balance';

      // Deduct from sender
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ [balanceField]: balance - amount })
        .eq('user_id', user.id);

      if (deductError) throw deductError;

      // Add to artist
      const { data: artistProfile } = await supabase
        .from('profiles')
        .select(balanceField)
        .eq('user_id', artistId)
        .single();

      if (artistProfile) {
        const artistBalance = (artistProfile as any)[balanceField] || 0;
        await supabase
          .from('profiles')
          .update({ [balanceField]: artistBalance + artistReceives })
          .eq('user_id', artistId);
      }

      // Record tip
      await supabase.from('tips').insert({
        from_user_id: user.id,
        to_artist_id: artistId,
        amount,
        token_symbol: tokenSymbol,
        message: message || null,
      });

      // Record artist earning
      await supabase.from('artist_earnings').insert({
        artist_id: artistId,
        amount: artistReceives,
        earning_type: 'tip',
        token_symbol: tokenSymbol,
        reference_id: user.id,
      });

      // Get artist profile for wallet address
      const { data: artistFullProfile } = await supabase
        .from('profiles')
        .select('web3_wallet_address, email')
        .eq('user_id', artistId)
        .single();

      // Record transaction in ledger
      const { data: txn } = await supabase.from('transactions_ledger').insert({
        transaction_type: 'tip',
        from_user_id: user.id,
        from_wallet_address: profile.web3_wallet_address,
        from_email: profile.email,
        to_user_id: artistId,
        to_wallet_address: artistFullProfile?.web3_wallet_address,
        to_email: artistFullProfile?.email,
        amount,
        token_symbol: tokenSymbol,
        fee_amount: fee,
        status: 'completed',
        description: message ? `Tip: ${message}` : 'Artist tip',
      }).select().single();

      // Create notifications with explorer links
      await supabase.from('notifications').insert([
        {
          user_id: user.id,
          type: 'transaction',
          title: 'Tip Sent! 🎉',
          message: `You sent ${amount} ${tokenSymbol} to an artist`,
          data: { transaction_hash: (txn as any)?.transaction_hash, explorer_link: `/explorer?txn=${(txn as any)?.transaction_hash}` }
        },
        {
          user_id: artistId,
          type: 'transaction',
          title: 'New Tip Received! 💰',
          message: `You received ${artistReceives} ${tokenSymbol}${message ? `: "${message}"` : ''}`,
          data: { transaction_hash: (txn as any)?.transaction_hash, explorer_link: `/explorer?txn=${(txn as any)?.transaction_hash}` }
        }
      ]);

      // Record fee burn
      if (fee > 0) {
        await supabase.from('burn_records').insert({
          token_symbol: tokenSymbol,
          amount: fee,
          burn_type: 'tip_fee',
          source_activity: 'artist_tip',
        });
      }

      await refreshProfile();

      toast({
        title: 'Tip Sent! 🎉',
        description: `Successfully sent ${amount} ${tokenSymbol} to the artist`,
      });

      return true;
    } catch (error) {
      console.error('Error sending tip:', error);
      toast({
        title: 'Error',
        description: 'Failed to send tip. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendTip,
    loading,
  };
}