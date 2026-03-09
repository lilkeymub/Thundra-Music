import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserStats {
  totalLikes: number;
  totalStreams: number;
  totalFollowers: number;
  totalFollowing: number;
}

interface ArtistStats {
  totalEarnings: number;
  totalStreams: number;
  totalLikes: number;
  trackCount: number;
}

// Hook for real-time user stats across the app
export function useRealTimeStats(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  const [userStats, setUserStats] = useState<UserStats>({
    totalLikes: 0,
    totalStreams: 0,
    totalFollowers: 0,
    totalFollowing: 0
  });
  const [artistStats, setArtistStats] = useState<ArtistStats>({
    totalEarnings: 0,
    totalStreams: 0,
    totalLikes: 0,
    trackCount: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchUserStats = useCallback(async () => {
    if (!targetUserId) return;

    // Fetch likes count (tracks the user has liked)
    const { count: likesCount } = await supabase
      .from('user_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', targetUserId);

    // Fetch followers count
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);

    // Fetch following count
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', targetUserId);

    // Fetch profile streams/likes from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_streams, total_likes')
      .eq('user_id', targetUserId)
      .single();

    setUserStats({
      totalLikes: likesCount || 0,
      totalStreams: profile?.total_streams || 0,
      totalFollowers: followersCount || 0,
      totalFollowing: followingCount || 0
    });
  }, [targetUserId]);

  const fetchArtistStats = useCallback(async () => {
    if (!targetUserId) return;

    // Fetch artist's tracks and sum their stats
    const { data: tracks } = await supabase
      .from('tracks')
      .select('id, plays_count, likes_count')
      .eq('artist_id', targetUserId);

    if (tracks) {
      const totalStreams = tracks.reduce((sum, t) => sum + (t.plays_count || 0), 0);
      const totalLikes = tracks.reduce((sum, t) => sum + (t.likes_count || 0), 0);
      
      // Fetch total earnings
      const { data: earnings } = await supabase
        .from('artist_earnings')
        .select('amount')
        .eq('artist_id', targetUserId);

      const totalEarnings = earnings?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      setArtistStats({
        totalEarnings,
        totalStreams,
        totalLikes,
        trackCount: tracks.length
      });
    }

    setLoading(false);
  }, [targetUserId]);

  useEffect(() => {
    fetchUserStats();
    fetchArtistStats();

    if (!targetUserId) return;

    // Real-time subscriptions
    const channel = supabase
      .channel(`user-stats-${targetUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_favorites', filter: `user_id=eq.${targetUserId}` }, fetchUserStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows', filter: `following_id=eq.${targetUserId}` }, fetchUserStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows', filter: `follower_id=eq.${targetUserId}` }, fetchUserStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tracks', filter: `artist_id=eq.${targetUserId}` }, fetchArtistStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'artist_earnings', filter: `artist_id=eq.${targetUserId}` }, fetchArtistStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `user_id=eq.${targetUserId}` }, fetchUserStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId, fetchUserStats, fetchArtistStats]);

  return { userStats, artistStats, loading, refetch: () => { fetchUserStats(); fetchArtistStats(); } };
}

// Hook for tracking featured artists with real-time stream updates
export function useFeaturedArtists(limit: number = 6) {
  const [artists, setArtists] = useState<Array<{
    user_id: string;
    username: string;
    avatar_url: string | null;
    total_streams: number;
    track_count: number;
    bio?: string;
    followers_count: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchArtists = useCallback(async () => {
    // Get verified artists
    const { data: artistRoles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'artist');

    if (!artistRoles || artistRoles.length === 0) {
      setLoading(false);
      return;
    }

    const artistIds = artistRoles.map(r => r.user_id);

    // Get profiles with streams
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, bio, total_streams')
      .in('user_id', artistIds);

    // Get track counts per artist
    const { data: tracks } = await supabase
      .from('tracks')
      .select('artist_id, plays_count')
      .in('artist_id', artistIds);

    // Get follower counts
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .in('following_id', artistIds);

    // Calculate stats
    const trackStats = new Map<string, { count: number; streams: number }>();
    tracks?.forEach(t => {
      if (t.artist_id) {
        const existing = trackStats.get(t.artist_id) || { count: 0, streams: 0 };
        trackStats.set(t.artist_id, {
          count: existing.count + 1,
          streams: existing.streams + (t.plays_count || 0)
        });
      }
    });

    const followerCounts = new Map<string, number>();
    follows?.forEach(f => {
      followerCounts.set(f.following_id, (followerCounts.get(f.following_id) || 0) + 1);
    });

    const enrichedArtists = profiles
      ?.map(p => ({
        user_id: p.user_id,
        username: p.username || 'Artist',
        avatar_url: p.avatar_url,
        bio: p.bio || undefined,
        total_streams: trackStats.get(p.user_id)?.streams || p.total_streams || 0,
        track_count: trackStats.get(p.user_id)?.count || 0,
        followers_count: followerCounts.get(p.user_id) || 0
      }))
      .filter(a => a.track_count > 0)
      .sort((a, b) => b.total_streams - a.total_streams)
      .slice(0, limit) || [];

    setArtists(enrichedArtists);
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchArtists();

    // Real-time subscription for tracks (stream updates)
    const channel = supabase
      .channel('featured-artists-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tracks' }, fetchArtists)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, fetchArtists)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, fetchArtists)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchArtists]);

  return { artists, loading, refetch: fetchArtists };
}

// Hook for real-time balance updates
export function useRealTimeBalance() {
  const { user, profile } = useAuth();
  const [balances, setBalances] = useState({
    thdr: 0,
    usdt: 0
  });

  const fetchBalances = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('thdr_balance')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setBalances({
        thdr: data.thdr_balance || 0,
        usdt: 0
      });
    }
  }, [user]);

  useEffect(() => {
    // Initialize from profile context
    if (profile) {
      setBalances({
        thdr: profile.thdr_balance || 0,
        usdt: 0
      });
    }

    if (!user) return;

    fetchBalances();

    // Real-time subscription
    const channel = supabase
      .channel(`balance-${user.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles', 
        filter: `user_id=eq.${user.id}` 
      }, (payload) => {
        setBalances({
          thdr: payload.new.thdr_balance || 0,
          usdt: 0
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, profile, fetchBalances]);

  return { balances, refetch: fetchBalances };
}
