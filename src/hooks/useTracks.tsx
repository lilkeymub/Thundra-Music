import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover_url: string | null;
  audio_url: string | null;
  duration: string | null;
  genre: string | null;
  plays_count: number;
  likes_count: number;
  lyrics: string | null;
  created_at: string;
}

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTracks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('plays_count', { ascending: false });

      if (error) throw error;
      setTracks(data || []);
    } catch (error) {
      console.error('Error fetching tracks:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  return { tracks, loading, refetch: fetchTracks };
}
