import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRewards } from './useRewards';

export interface Comment {
  id: string;
  track_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
  avatar_url?: string;
}

export interface Reaction {
  reaction_type: string;
  count: number;
}

const REACTION_TYPES = ['❤️', '🔥', '💎', '🎵', '👏', '😍'];

export function useTrackInteractions(trackId: string | null) {
  const { user } = useAuth();
  const { awardReward } = useRewards();
  const [comments, setComments] = useState<Comment[]>([]);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!trackId) return;

    const { data, error } = await supabase
      .from('track_comments')
      .select('*')
      .eq('track_id', trackId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    // Fetch usernames for comments
    const userIds = [...new Set(data.map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url')
      .in('user_id', userIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
    
    const commentsWithUsernames = data.map(c => ({
      ...c,
      username: profileMap.get(c.user_id)?.username || 'Anonymous',
      avatar_url: profileMap.get(c.user_id)?.avatar_url
    }));

    setComments(commentsWithUsernames);
  }, [trackId]);

  const fetchReactions = useCallback(async () => {
    if (!trackId) return;

    const { data, error } = await supabase
      .from('track_reactions')
      .select('reaction_type')
      .eq('track_id', trackId);

    if (error) {
      console.error('Error fetching reactions:', error);
      return;
    }

    // Count reactions by type
    const counts = data.reduce((acc, r) => {
      acc[r.reaction_type] = (acc[r.reaction_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setReactions(
      REACTION_TYPES.map(type => ({
        reaction_type: type,
        count: counts[type] || 0
      }))
    );

    // Get user's reactions
    if (user) {
      const { data: userReactionsData } = await supabase
        .from('track_reactions')
        .select('reaction_type')
        .eq('track_id', trackId)
        .eq('user_id', user.id);

      setUserReactions(userReactionsData?.map(r => r.reaction_type) || []);
    }
  }, [trackId, user]);

  useEffect(() => {
    if (trackId) {
      setLoading(true);
      Promise.all([fetchComments(), fetchReactions()]).finally(() => setLoading(false));
    }
  }, [trackId, fetchComments, fetchReactions]);

  // Real-time subscriptions
  useEffect(() => {
    if (!trackId) return;

    const commentsChannel = supabase
      .channel(`comments-${trackId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'track_comments', filter: `track_id=eq.${trackId}` },
        async (payload) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', payload.new.user_id)
            .single();

          const newComment = {
            ...payload.new,
            username: profile?.username || 'Anonymous',
            avatar_url: profile?.avatar_url
          } as Comment;

          setComments(prev => [newComment, ...prev]);
        }
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel(`reactions-${trackId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'track_reactions', filter: `track_id=eq.${trackId}` },
        () => {
          fetchReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(reactionsChannel);
    };
  }, [trackId, fetchReactions]);

  const addComment = useCallback(async (content: string): Promise<boolean> => {
    if (!user || !trackId || !content.trim()) return false;

    const { error } = await supabase
      .from('track_comments')
      .insert({ track_id: trackId, user_id: user.id, content: content.trim() });

    if (error) {
      console.error('Error adding comment:', error);
      return false;
    }

    // Award reward for commenting
    await awardReward('comment', trackId);

    return true;
  }, [user, trackId, awardReward]);

  const toggleReaction = useCallback(async (reactionType: string): Promise<boolean> => {
    if (!user || !trackId) return false;

    const hasReaction = userReactions.includes(reactionType);

    if (hasReaction) {
      const { error } = await supabase
        .from('track_reactions')
        .delete()
        .eq('track_id', trackId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);

      if (error) {
        console.error('Error removing reaction:', error);
        return false;
      }

      setUserReactions(prev => prev.filter(r => r !== reactionType));
    } else {
      const { error } = await supabase
        .from('track_reactions')
        .insert({ track_id: trackId, user_id: user.id, reaction_type: reactionType });

      if (error) {
        console.error('Error adding reaction:', error);
        return false;
      }

      setUserReactions(prev => [...prev, reactionType]);
      
      // Award reward for reacting
      await awardReward('reaction', trackId);
    }

    return true;
  }, [user, trackId, userReactions, awardReward]);

  return {
    comments,
    reactions,
    userReactions,
    loading,
    addComment,
    toggleReaction,
    REACTION_TYPES
  };
}
