import { Crown, Shield, Music, Briefcase, CheckCircle, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserRole, AppRole } from '@/hooks/useUserRole';

interface RoleBadgeProps {
  role?: AppRole;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const roleConfig: Record<AppRole, { icon: any; color: string; bg: string; label: string }> = {
  free: { icon: null, color: '', bg: '', label: 'Free' },
  premium: { icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/20', label: 'Premium' },
  vip: { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500/20', label: 'VIP' },
  artist: { icon: Music, color: 'text-red-500', bg: 'bg-red-500/20', label: 'Artist' },
  moderator: { icon: Shield, color: 'text-gray-400', bg: 'bg-gray-400/20', label: 'Moderator' },
  business: { icon: Briefcase, color: 'text-green-500', bg: 'bg-green-500/20', label: 'Business' },
  admin: { icon: Crown, color: 'text-yellow-500', bg: 'bg-yellow-500', label: 'Admin' },
};

export function RoleBadge({ role, showText = true, size = 'md' }: RoleBadgeProps) {
  const config = role ? roleConfig[role] : null;
  
  if (!config || !config.icon) return null;

  const Icon = config.icon;
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (!showText) {
    return <Icon className={`${sizeClasses[size]} ${config.color}`} />;
  }

  return (
    <Badge 
      variant="outline" 
      className={`${config.bg} border-none ${config.color} ${
        role === 'admin' ? 'text-black' : ''
      }`}
    >
      <Icon className={`${sizeClasses[size]} mr-1`} />
      {config.label}
    </Badge>
  );
}

export function VerifiedTick({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { getTickColor, primaryRole } = useUserRole();
  const tickColor = getTickColor();

  if (!tickColor) return null;

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return <CheckCircle className={`${sizeClasses[size]} ${tickColor}`} />;
}
