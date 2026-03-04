import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'free' | 'premium' | 'vip' | 'artist' | 'moderator' | 'business' | 'admin';

interface UserRole {
  role: AppRole;
  expiresAt: Date | null;
}

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [primaryRole, setPrimaryRole] = useState<AppRole>('free');

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setPrimaryRole('free');
      setLoading(false);
      return;
    }

    const fetchRoles = async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, expires_at')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching roles:', error);
        setLoading(false);
        return;
      }

      const validRoles = (data || [])
        .filter(r => !r.expires_at || new Date(r.expires_at) > new Date())
        .map(r => ({
          role: r.role as AppRole,
          expiresAt: r.expires_at ? new Date(r.expires_at) : null
        }));

      setRoles(validRoles);

      // Determine primary role (highest priority)
      const rolePriority: AppRole[] = ['admin', 'moderator', 'business', 'artist', 'vip', 'premium', 'free'];
      const primary = rolePriority.find(r => validRoles.some(ur => ur.role === r)) || 'free';
      setPrimaryRole(primary);
      setLoading(false);
    };

    fetchRoles();
  }, [user]);

  const hasRole = (role: AppRole) => roles.some(r => r.role === role);
  const isPremiumOrAbove = hasRole('premium') || hasRole('vip') || hasRole('artist') || hasRole('moderator') || hasRole('business') || hasRole('admin');
  const isVipOrAbove = hasRole('vip') || hasRole('artist') || hasRole('moderator') || hasRole('business') || hasRole('admin');
  const isArtist = hasRole('artist');
  const isModerator = hasRole('moderator');
  const isBusiness = hasRole('business');
  const isAdmin = hasRole('admin');

  const getTickColor = (): string | null => {
    if (isBusiness) return 'text-green-500';
    if (isModerator) return 'text-gray-400';
    if (isArtist) return 'text-red-500';
    if (hasRole('vip')) return 'text-yellow-500';
    if (hasRole('premium')) return 'text-blue-500';
    return null;
  };

  return {
    roles,
    primaryRole,
    loading,
    hasRole,
    isPremiumOrAbove,
    isVipOrAbove,
    isArtist,
    isModerator,
    isBusiness,
    isAdmin,
    getTickColor,
  };
}
