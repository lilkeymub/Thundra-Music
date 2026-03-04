import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

// Reward rates for different activities
const REWARD_RATES: Record<string, number> = {
  stream: 0.01,           // Per stream
  like: 0.005,            // Per like
  comment: 0.02,          // Per comment
  share: 0.03,            // Per share
  post: 0.05,             // Per post created
  reaction: 0.002,        // Per reaction
  dm_sent: 0.01,          // Per DM sent
  join_space: 0.1,        // Joining audio space
  host_space: 0.5,        // Hosting audio space
  course_complete: 5,     // Completing a course
  referral_signup: 10,    // Per referral signup
  referral_daily: 0.01,   // % of referral's daily earnings
  merch_purchase: 0.1,    // % of purchase as cashback
  poll_vote: 0.01,        // Per poll vote
  event_attend: 0.2,      // Per event attendance
};

export function useRewards() {
  const { user } = useAuth();
  const { isPremiumOrAbove, isVipOrAbove } = useUserRole();
  const { toast } = useToast();

  const getMultiplier = (): number => {
    if (isVipOrAbove) return 3;
    if (isPremiumOrAbove) return 2;
    return 1;
  };

  const awardReward = async (activityType: string, referenceId?: string): Promise<number> => {
    if (!user) return 0;

    const baseReward = REWARD_RATES[activityType] || 0;
    const multiplier = getMultiplier();
    const finalReward = baseReward * multiplier;

    if (finalReward <= 0) return 0;

    try {
      // Record reward activity
      await supabase.from('reward_activities').insert({
        user_id: user.id,
        activity_type: activityType,
        base_reward: baseReward,
        multiplier,
        final_reward: finalReward,
        reference_id: referenceId || null,
      });

      // Get current balance from profiles and update
      const { data: profile } = await supabase
        .from('profiles')
        .select('thdr_balance, web3_wallet_address, email')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const newBalance = (profile.thdr_balance || 0) + finalReward;
        await supabase
          .from('profiles')
          .update({ thdr_balance: newBalance })
          .eq('user_id', user.id);

        // Also record in transactions_ledger for transparency
        await supabase.from('transactions_ledger').insert({
          transaction_type: 'reward',
          to_user_id: user.id,
          to_wallet_address: profile.web3_wallet_address,
          to_email: profile.email,
          amount: finalReward,
          token_symbol: 'THDR',
          status: 'completed',
          description: `Reward for ${activityType}`,
        });

        // Create notification
        await supabase.from('notifications').insert({
          user_id: user.id,
          type: 'earning',
          title: 'Tokens Earned! 🎉',
          message: `You earned ${finalReward.toFixed(4)} THDR for ${activityType}`,
          data: { activity: activityType, amount: finalReward }
        });
      }

      // Deduct from ecosystem rewards pool
      const { data: pool } = await supabase
        .from('token_supply')
        .select('current_supply')
        .eq('token_symbol', 'THDR')
        .eq('pool_name', 'ecosystem_rewards')
        .maybeSingle();

      if (pool) {
        await supabase
          .from('token_supply')
          .update({ current_supply: Number(pool.current_supply) - finalReward })
          .eq('token_symbol', 'THDR')
          .eq('pool_name', 'ecosystem_rewards');
      }

      // Process referral rewards
      const { data: referral } = await supabase
        .from('referrals')
        .select('referrer_id, reward_earned')
        .eq('referred_id', user.id)
        .maybeSingle();

      if (referral) {
        const referrerReward = finalReward * REWARD_RATES.referral_daily;
        
        // Award referrer from profiles table
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('thdr_balance')
          .eq('user_id', referral.referrer_id)
          .single();

        if (referrerProfile) {
          await supabase
            .from('profiles')
            .update({ thdr_balance: (referrerProfile.thdr_balance || 0) + referrerReward })
            .eq('user_id', referral.referrer_id);

          // Update referral earnings
          await supabase
            .from('referrals')
            .update({ 
              reward_earned: Number(referral.reward_earned || 0) + referrerReward
            })
            .eq('referred_id', user.id);
        }
      }

      return finalReward;
    } catch (error) {
      console.error('Error awarding reward:', error);
      return 0;
    }
  };

  const processPlatformFee = async (
    amount: number,
    activityType: 'streaming' | 'marketplace' | 'ads' | 'post',
    tokenSymbol: string = 'THDR'
  ): Promise<void> => {
    const feeRate = 0.10; // 10% platform fee
    const feeAmount = amount * feeRate;

    let burnAmount: number;
    let partnershipAmount: number;

    if (activityType === 'marketplace' || activityType === 'ads') {
      burnAmount = feeAmount * 0.5;
      partnershipAmount = feeAmount * 0.5;
    } else {
      burnAmount = feeAmount;
      partnershipAmount = 0;
    }

    // Record fee
    await supabase.from('fee_collections').insert({
      activity_type: activityType,
      original_amount: amount,
      fee_amount: feeAmount,
      token_symbol: tokenSymbol,
      burned_amount: burnAmount,
      partnership_pool_amount: partnershipAmount,
    });

    // Burn tokens
    await supabase.from('burn_records').insert({
      token_symbol: tokenSymbol,
      amount: burnAmount,
      burn_type: 'fee_burn',
      source_activity: activityType,
    });

    // Add to partnership pool if applicable
    if (partnershipAmount > 0) {
      const { data: pool } = await supabase
        .from('token_supply')
        .select('current_supply')
        .eq('token_symbol', 'THDR')
        .eq('pool_name', 'partnership_growth')
        .maybeSingle();

      if (pool) {
        await supabase
          .from('token_supply')
          .update({ current_supply: Number(pool.current_supply) + partnershipAmount })
          .eq('token_symbol', 'THDR')
          .eq('pool_name', 'partnership_growth');
      }
    }
  };

  const distributeContentRewards = async (
    amount: number,
    creatorId: string,
    interactorIds: string[]
  ): Promise<void> => {
    const creatorShare = amount * 0.65;
    const interactorShare = amount * 0.25;
    const platformShare = amount * 0.10;

    // Pay creator - update profiles table
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('thdr_balance, web3_wallet_address, email')
      .eq('user_id', creatorId)
      .single();

    if (creatorProfile) {
      await supabase
        .from('profiles')
        .update({ thdr_balance: (creatorProfile.thdr_balance || 0) + creatorShare })
        .eq('user_id', creatorId);

      // Record in ledger
      await supabase.from('transactions_ledger').insert({
        transaction_type: 'reward',
        to_user_id: creatorId,
        to_wallet_address: creatorProfile.web3_wallet_address,
        to_email: creatorProfile.email,
        amount: creatorShare,
        token_symbol: 'THDR',
        status: 'completed',
        description: 'Content creator earnings',
      });
    }

    // Distribute to interactors
    if (interactorIds.length > 0) {
      const perInteractor = interactorShare / interactorIds.length;
      
      for (const interactorId of interactorIds) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('thdr_balance')
          .eq('user_id', interactorId)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ thdr_balance: (profile.thdr_balance || 0) + perInteractor })
            .eq('user_id', interactorId);
        }
      }
    }

    // Process platform fee (burn 100%)
    await processPlatformFee(platformShare, 'streaming', 'THDR');
  };

  return {
    awardReward,
    processPlatformFee,
    distributeContentRewards,
    getMultiplier,
    REWARD_RATES,
  };
}
