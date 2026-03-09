import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { createNotification } from './useNotifications';

export interface SectionBadgeCounts {
  chat: number;
  wallet: number;
  music: number;
  market: number;
  learning: number;
  profile: number;
  ads: number;
  artist: number;
  moderator: number;
  admin: number;
  leaderboard: number;
  favorites: number;
}

export function useEcosystemNotifications() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<SectionBadgeCounts>({
    chat: 0, wallet: 0, music: 0, market: 0, learning: 0,
    profile: 0, ads: 0, artist: 0, moderator: 0, admin: 0,
    leaderboard: 0, favorites: 0,
  });

  const incrementBadge = useCallback((section: keyof SectionBadgeCounts) => {
    setBadges(prev => ({ ...prev, [section]: prev[section] + 1 }));
  }, []);

  const clearBadge = useCallback((section: keyof SectionBadgeCounts) => {
    setBadges(prev => ({ ...prev, [section]: 0 }));
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to notifications table for this user
    const notifChannel = supabase
      .channel(`eco-notif-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, (payload: any) => {
        const notif = payload.new;
        const type = notif?.type || '';

        // Map notification types to sections
        if (['dm', 'mention', 'group_message', 'channel_message', 'repost'].includes(type)) {
          incrementBadge('chat');
        } else if (['transaction', 'earning', 'tip', 'reward', 'deposit', 'withdrawal'].includes(type)) {
          incrementBadge('wallet');
        } else if (['new_release', 'track_approved'].includes(type)) {
          incrementBadge('music');
        } else if (['purchase', 'merch_sold', 'nft_sold', 'auction_bid'].includes(type)) {
          incrementBadge('market');
        } else if (['course_complete', 'course_enrolled'].includes(type)) {
          incrementBadge('learning');
        } else if (['follow', 'subscription', 'achievement'].includes(type)) {
          incrementBadge('profile');
        } else if (['ad_click', 'ad_expired', 'campaign_complete'].includes(type)) {
          incrementBadge('ads');
        } else if (['like', 'comment', 'stream_milestone'].includes(type)) {
          incrementBadge('artist');
        } else if (['report', 'moderation_vote', 'content_removed'].includes(type)) {
          incrementBadge('moderator');
        }
      })
      .subscribe();

    // Subscribe to DMs
    const dmChannel = supabase
      .channel(`eco-dm-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `receiver_id=eq.${user.id}`,
      }, () => {
        incrementBadge('chat');
      })
      .subscribe();

    // Subscribe to follows
    const followChannel = supabase
      .channel(`eco-follow-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'follows',
        filter: `following_id=eq.${user.id}`,
      }, async (payload: any) => {
        incrementBadge('profile');
        const followerId = payload.new?.follower_id;
        if (followerId) {
          const { data: followerProfile } = await supabase
            .from('profiles')
            .select('username')
            .eq('user_id', followerId)
            .single();
          createNotification(
            user.id, 'follow',
            'New Follower! 👤',
            `@${followerProfile?.username || 'Someone'} started following you`,
            { follower_id: followerId }
          );
        }
      })
      .subscribe();

    // Subscribe to track reactions (likes on artist content)
    const reactionChannel = supabase
      .channel(`eco-reactions-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'track_reactions',
      }, async (payload: any) => {
        // Check if the track belongs to current user
        const trackId = payload.new?.track_id;
        if (trackId) {
          const { data: track } = await supabase
            .from('tracks')
            .select('artist_id, title')
            .eq('id', trackId)
            .single();
          if (track?.artist_id === user.id) {
            incrementBadge('artist');
            incrementBadge('music');
            createNotification(
              user.id, 'like',
              'New Like ❤️',
              `Someone liked your track "${track.title}"`,
              { track_id: trackId }
            );
          }
        }
      })
      .subscribe();

    // Subscribe to track comments
    const commentChannel = supabase
      .channel(`eco-comments-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'track_comments',
      }, async (payload: any) => {
        const trackId = payload.new?.track_id;
        if (trackId) {
          const { data: track } = await supabase
            .from('tracks')
            .select('artist_id, title')
            .eq('id', trackId)
            .single();
          if (track?.artist_id === user.id && payload.new?.user_id !== user.id) {
            incrementBadge('artist');
            createNotification(
              user.id, 'comment',
              'New Comment 💬',
              `Someone commented on "${track.title}"`,
              { track_id: trackId }
            );
          }
        }
      })
      .subscribe();

    // Subscribe to post reactions
    const postReactionChannel = supabase
      .channel(`eco-post-reactions-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'post_reactions',
      }, async (payload: any) => {
        const postId = payload.new?.post_id;
        if (postId) {
          const { data: post } = await supabase
            .from('feed_posts')
            .select('user_id')
            .eq('id', postId)
            .single();
          if (post?.user_id === user.id && payload.new?.user_id !== user.id) {
            incrementBadge('chat');
            createNotification(
              user.id, 'like',
              'Post Reaction 🔥',
              'Someone reacted to your post',
              { post_id: postId }
            );
          }
        }
      })
      .subscribe();

    // Subscribe to transactions
    const txChannel = supabase
      .channel(`eco-tx-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions_ledger',
        filter: `to_user_id=eq.${user.id}`,
      }, (payload: any) => {
        incrementBadge('wallet');
        const tx = payload.new;
        createNotification(
          user.id, 'transaction',
          '💰 Payment Received',
          `You received ${tx?.amount || 0} ${tx?.token_symbol || 'THDR'}`,
          { transaction_id: tx?.id }
        );
      })
      .subscribe();

    // Subscribe to merch purchases (seller side)
    const merchChannel = supabase
      .channel(`eco-merch-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'merch_purchases',
        filter: `seller_id=eq.${user.id}`,
      }, (payload: any) => {
        incrementBadge('market');
        createNotification(
          user.id, 'purchase',
          '🛍️ Merch Sold!',
          `You sold an item for ${payload.new?.price || 0} THDR`,
          { purchase_id: payload.new?.id }
        );
      })
      .subscribe();

    // Subscribe to artist earnings
    const earningsChannel = supabase
      .channel(`eco-earnings-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'artist_earnings',
        filter: `artist_id=eq.${user.id}`,
      }, (payload: any) => {
        incrementBadge('wallet');
        incrementBadge('artist');
      })
      .subscribe();

    // Subscribe to moderation actions
    const modChannel = supabase
      .channel(`eco-mod-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'moderation_actions',
      }, () => {
        incrementBadge('moderator');
      })
      .subscribe();

    // Subscribe to reports
    const reportChannel = supabase
      .channel(`eco-reports-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'reports',
      }, () => {
        incrementBadge('moderator');
        incrementBadge('admin');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(dmChannel);
      supabase.removeChannel(followChannel);
      supabase.removeChannel(reactionChannel);
      supabase.removeChannel(commentChannel);
      supabase.removeChannel(postReactionChannel);
      supabase.removeChannel(txChannel);
      supabase.removeChannel(merchChannel);
      supabase.removeChannel(earningsChannel);
      supabase.removeChannel(modChannel);
      supabase.removeChannel(reportChannel);
    };
  }, [user, incrementBadge]);

  return { badges, clearBadge, incrementBadge };
}
