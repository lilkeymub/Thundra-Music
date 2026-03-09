import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { createNotification } from './useNotifications';

// Reward rates for different activities (in THDR)
const REWARD_RATES: Record<string, number> = {
  stream: 0.01,
  like: 0.005,
  comment: 0.02,
  share: 0.03,
  post: 0.05,
  reaction: 0.002,
  dm_sent: 0.01,
  join_space: 0.1,
  host_space: 0.5,
  course_complete: 5,
  referral_signup: 10,
  referral_daily: 0.01,
  merch_purchase: 0.1,
  poll_vote: 0.01,
  event_attend: 0.2,
};

export function useRewards() {
  const { user, profile } = useAuth();
  const { isPremiumOrAbove, isVipOrAbove, hasRole } = useUserRole();
  const { toast } = useToast();

  const getMultiplier = (): number => {
    let tierMultiplier = 1;
    let roleMultiplier = 0;

    if (isVipOrAbove) tierMultiplier = 3;
    else if (isPremiumOrAbove) tierMultiplier = 2;

    if (hasRole('artist')) roleMultiplier = 2;
    else if (hasRole('moderator')) roleMultiplier = 1.75;

    if (tierMultiplier === 1 && roleMultiplier > 0) return roleMultiplier;
    return tierMultiplier + roleMultiplier;
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

      // Send reward on-chain from treasury via edge function
      const { data, error } = await supabase.functions.invoke('blockchain', {
        body: {
          action: 'send_reward',
          user_id: user.id,
          to_address: profile?.web3_wallet_address || null,
          amount: finalReward,
          activity_type: activityType,
        },
      });

      if (error) {
        console.error('On-chain reward failed:', error);
        return 0;
      }

      // Create notification for the reward
      const activityLabels: Record<string, string> = {
        stream: '🎧 Stream Reward',
        like: '❤️ Like Reward',
        comment: '💬 Comment Reward',
        share: '🔗 Share Reward',
        post: '📝 Post Reward',
        referral_signup: '👥 Referral Bonus',
        course_complete: '🎓 Course Completion',
        merch_purchase: '🛍️ Purchase Reward',
      };
      const label = activityLabels[activityType] || '🎁 Reward';
      createNotification(
        user.id,
        'earning',
        label,
        `You earned ${finalReward.toFixed(4)} $THDR for ${activityType.replace('_', ' ')}`,
        { amount: finalReward, activity_type: activityType }
      );

      // Process referral rewards
      const { data: referral } = await supabase
        .from('referrals')
        .select('referrer_id, reward_earned')
        .eq('referred_id', user.id)
        .maybeSingle();

      if (referral) {
        const referrerReward = finalReward * REWARD_RATES.referral_daily;
        const { data: referrerProfile } = await supabase
          .from('profiles')
          .select('web3_wallet_address')
          .eq('user_id', referral.referrer_id)
          .single();

        if (referrerProfile?.web3_wallet_address) {
          await supabase.functions.invoke('blockchain', {
            body: {
              action: 'send_reward',
              user_id: referral.referrer_id,
              to_address: referrerProfile.web3_wallet_address,
              amount: referrerReward,
              activity_type: 'referral_bonus',
            },
          });
        }

        await supabase
          .from('referrals')
          .update({ reward_earned: Number(referral.reward_earned || 0) + referrerReward })
          .eq('referred_id', user.id);
      }

      return finalReward;
    } catch (error) {
      console.error('Error awarding reward:', error);
      return 0;
    }
  };

  const processPlatformFee = async (
    amount: number,
    activityType: 'streaming' | 'marketplace' | 'ads' | 'post' | 'subscription' | 'dm_stake',
    tokenSymbol: string = 'THDR'
  ): Promise<void> => {
    const feeRate = 0.10;
    const feeAmount = amount * feeRate;

    let burnAmount: number;
    let partnershipAmount: number;

    if (activityType === 'marketplace' || activityType === 'ads' || activityType === 'subscription') {
      burnAmount = feeAmount * 0.5;
      partnershipAmount = feeAmount * 0.5;
    } else if (activityType === 'dm_stake') {
      burnAmount = feeAmount; // 100% burned
      partnershipAmount = 0;
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

    // Burn tokens on-chain via edge function
    await supabase.functions.invoke('blockchain', {
      body: {
        action: 'burn_tokens',
        amount: burnAmount,
        burn_type: 'fee_burn',
        source_activity: activityType,
        user_id: user?.id,
        token: tokenSymbol,
      },
    });
  };

  const distributeContentRewards = async (
    amount: number,
    creatorId: string,
    interactorIds: string[]
  ): Promise<void> => {
    const creatorShare = amount * 0.65;
    const interactorShare = amount * 0.25;
    const platformShare = amount * 0.10;

    // Pay creator on-chain
    const { data: creatorProfile } = await supabase
      .from('profiles')
      .select('web3_wallet_address')
      .eq('user_id', creatorId)
      .single();

    if (creatorProfile?.web3_wallet_address) {
      await supabase.functions.invoke('blockchain', {
        body: {
          action: 'send_reward',
          user_id: creatorId,
          to_address: creatorProfile.web3_wallet_address,
          amount: creatorShare,
          activity_type: 'content_creator_earnings',
        },
      });
    }

    // Distribute to interactors on-chain
    if (interactorIds.length > 0) {
      const perInteractor = interactorShare / interactorIds.length;
      for (const interactorId of interactorIds) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('web3_wallet_address')
          .eq('user_id', interactorId)
          .single();

        if (profile?.web3_wallet_address) {
          await supabase.functions.invoke('blockchain', {
            body: {
              action: 'send_reward',
              user_id: interactorId,
              to_address: profile.web3_wallet_address,
              amount: perInteractor,
              activity_type: 'content_interactor_reward',
            },
          });
        }
      }
    }

    // Burn platform share on-chain (100%)
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
