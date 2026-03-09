import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const THDR_CONTRACT = "0xb1c3338aBD99BCb7ca0F5f8dBAD4666B2bD9953c";
const USDT_CONTRACT = "0xcd51edf2881de8ebb8a4ddb8f44860b818b78b48";
const TREASURY_WALLET = "0x38bc74e79b6e7d66b594124a6ccc92cef0974404";
const BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const SEPOLIA_CHAIN_ID = 11155111;
const EXPLORER_BASE = "https://sepolia.etherscan.io";

interface OnChainBalances {
  thdr: number;
  usdt: number;
}

export function useBlockchain() {
  const [loading, setLoading] = useState(false);

  const callBlockchain = useCallback(async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke('blockchain', {
      body: { action, ...params },
    });
    if (error) throw error;
    return data;
  }, []);

  const getOnChainBalances = useCallback(async (walletAddress: string): Promise<OnChainBalances> => {
    try {
      setLoading(true);
      const data = await callBlockchain('get_balances', { wallet_address: walletAddress });
      return { thdr: data.thdr || 0, usdt: data.usdt || 0 };
    } catch (err) {
      console.error('Failed to fetch on-chain balances:', err);
      return { thdr: 0, usdt: 0 };
    } finally {
      setLoading(false);
    }
  }, [callBlockchain]);

  const createWallet = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const data = await callBlockchain('create_wallet', { user_id: userId });
      return data;
    } catch (err) {
      console.error('Failed to create wallet:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callBlockchain]);

  const getMnemonic = useCallback(async (userId: string) => {
    try {
      const data = await callBlockchain('get_mnemonic', { user_id: userId });
      return data;
    } catch (err) {
      console.error('Failed to get mnemonic:', err);
      return null;
    }
  }, [callBlockchain]);

  const sendReward = useCallback(async (userId: string, toAddress: string | null, amount: number, activityType: string) => {
    try {
      setLoading(true);
      return await callBlockchain('send_reward', {
        user_id: userId,
        to_address: toAddress,
        amount,
        activity_type: activityType,
      });
    } catch (err) {
      console.error('Failed to send reward:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callBlockchain]);

  const sendTokens = useCallback(async (fromUserId: string, fromAddress: string, toAddress: string, amount: number, token: string) => {
    try {
      setLoading(true);
      return await callBlockchain('send_tokens', {
        from_user_id: fromUserId,
        from_address: fromAddress,
        to_address: toAddress,
        amount,
        token,
      });
    } catch (err) {
      console.error('Failed to send tokens:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callBlockchain]);

  const transferFromTreasury = useCallback(async (toAddress: string, amount: number, token: string, description: string, userId?: string) => {
    try {
      setLoading(true);
      return await callBlockchain('transfer_from_treasury', {
        to_address: toAddress,
        amount,
        token,
        description,
        user_id: userId,
      });
    } catch (err) {
      console.error('Failed to transfer from treasury:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callBlockchain]);

  const burnTokens = useCallback(async (amount: number, burnType: string, sourceActivity: string, userId?: string, token?: string) => {
    try {
      setLoading(true);
      return await callBlockchain('burn_tokens', {
        amount,
        burn_type: burnType,
        source_activity: sourceActivity,
        user_id: userId,
        token: token || 'THDR',
      });
    } catch (err) {
      console.error('Failed to burn tokens:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callBlockchain]);

  const stakeTokens = useCallback(async (userId: string, amount: number, durationDays: number, token?: string) => {
    try {
      setLoading(true);
      return await callBlockchain('stake_tokens', {
        user_id: userId,
        amount,
        duration_days: durationDays,
        token: token || 'THDR',
      });
    } catch (err) {
      console.error('Failed to stake tokens:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callBlockchain]);

  const unstakeTokens = useCallback(async (userId: string, positionId: string) => {
    try {
      setLoading(true);
      return await callBlockchain('unstake_tokens', {
        user_id: userId,
        position_id: positionId,
      });
    } catch (err) {
      console.error('Failed to unstake:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callBlockchain]);

  const burnAndEarn = useCallback(async (userId: string, amount: number, durationDays: number, token?: string) => {
    try {
      setLoading(true);
      return await callBlockchain('burn_and_earn', {
        user_id: userId,
        amount,
        duration_days: durationDays,
        token: token || 'THDR',
      });
    } catch (err) {
      console.error('Failed to burn & earn:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callBlockchain]);

  const claimBurnEarn = useCallback(async (userId: string, positionId: string) => {
    try {
      setLoading(true);
      return await callBlockchain('claim_burn_earn', {
        user_id: userId,
        position_id: positionId,
      });
    } catch (err) {
      console.error('Failed to claim burn & earn:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callBlockchain]);

  const syncBalance = useCallback(async (userId: string, walletAddress: string) => {
    try {
      setLoading(true);
      return await callBlockchain('sync_balance', { user_id: userId, wallet_address: walletAddress });
    } catch (err) {
      console.error('Failed to sync balance:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [callBlockchain]);

  const getTreasuryBalances = useCallback(async () => {
    try {
      return await callBlockchain('get_treasury_balances');
    } catch (err) {
      console.error('Failed to get treasury balances:', err);
      return null;
    }
  }, [callBlockchain]);

  const getExplorerUrl = (txHash: string) => `${EXPLORER_BASE}/tx/${txHash}`;
  const getAddressUrl = (address: string) => `${EXPLORER_BASE}/address/${address}`;
  const getTokenUrl = (contract: string) => `${EXPLORER_BASE}/token/${contract}`;

  return {
    loading,
    getOnChainBalances,
    createWallet,
    getMnemonic,
    sendReward,
    sendTokens,
    transferFromTreasury,
    burnTokens,
    stakeTokens,
    unstakeTokens,
    burnAndEarn,
    claimBurnEarn,
    syncBalance,
    getTreasuryBalances,
    getExplorerUrl,
    getAddressUrl,
    getTokenUrl,
    THDR_CONTRACT,
    USDT_CONTRACT,
    TREASURY_WALLET,
    BURN_ADDRESS,
    SEPOLIA_CHAIN_ID,
    EXPLORER_BASE,
  };
}
