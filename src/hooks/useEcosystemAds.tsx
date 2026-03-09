import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface EcosystemAd {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string;
  ad_type: string;
  advertiser_id: string;
  advertiser_username?: string;
  advertiser_avatar?: string;
  budget?: number;
}

// Distribution: Home 12.5%, Feed 12.5%, Chat 12.5%, Learning 12.5%, Market 50%
const SECTION_WEIGHTS: Record<string, number> = {
  home: 0.125,
  feed: 0.125,
  chat: 0.125,
  learning: 0.125,
  market: 0.50,
};

const BOOST_COST_PER_PERCENT = 10;

export function useEcosystemAds(section: keyof typeof SECTION_WEIGHTS, maxAds: number = 2) {
  const { profile } = useAuth();
  const [ads, setAds] = useState<EcosystemAd[]>([]);

  const tier = profile?.tier || 'free';

  // VIP users see 0 ads, Premium sees 20% reach, Free sees 55%
  const shouldShowAds = tier !== 'vip';
  const baseShowProbability = tier === 'premium' ? 0.20 : 0.55;

  const fetchAds = useCallback(async () => {
    if (!shouldShowAds) {
      setAds([]);
      return;
    }

    const weight = SECTION_WEIGHTS[section] || 0.125;
    const adCount = Math.max(1, Math.round(maxAds * (weight / 0.125)));

    const now = new Date().toISOString();
    const { data } = await supabase
      .from('ads')
      .select('*')
      .eq('is_active', true)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order('created_at', { ascending: false })
      .limit(adCount * 5);

    if (!data || data.length === 0) {
      setAds([]);
      return;
    }

    // Each ad has a boost level derived from budget: boost% = max(0, (budget - geoCost - 1) / BOOST_COST_PER_PERCENT)
    // Higher budget = higher chance of being shown
    const weighted = data.map(ad => {
      const boostPercent = Math.max(0, ((ad.budget || 1) - 1) / BOOST_COST_PER_PERCENT);
      const adShowProbability = Math.min(1, baseShowProbability + (boostPercent / 100));
      return { ad, probability: adShowProbability };
    });

    // Filter by probability check per ad
    const visible = weighted.filter(w => Math.random() <= w.probability);

    if (visible.length === 0) {
      setAds([]);
      return;
    }

    // Shuffle and pick
    const shuffled = visible.sort(() => Math.random() - 0.5).slice(0, adCount);

    // Get advertiser info
    const advertiserIds = [...new Set(shuffled.map(a => a.ad.advertiser_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url')
      .in('user_id', advertiserIds);

    const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

    setAds(shuffled.map(({ ad }) => ({
      ...ad,
      advertiser_username: profileMap.get(ad.advertiser_id)?.username || 'Advertiser',
      advertiser_avatar: profileMap.get(ad.advertiser_id)?.avatar_url || undefined,
    })));
  }, [section, shouldShowAds, baseShowProbability, maxAds]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const recordImpression = async (adId: string) => {
    try {
      const { data } = await supabase.from('ads').select('impressions').eq('id', adId).single();
      if (data) {
        await supabase.from('ads').update({ impressions: (data.impressions || 0) + 1 }).eq('id', adId);
      }
    } catch { /* silent */ }
  };

  const recordClick = async (adId: string) => {
    try {
      const { data } = await supabase.from('ads').select('clicks').eq('id', adId).single();
      if (data) {
        await supabase.from('ads').update({ clicks: (data.clicks || 0) + 1 }).eq('id', adId);
      }
    } catch { /* silent */ }
  };

  return { ads, recordImpression, recordClick, shouldShowAds };
}
