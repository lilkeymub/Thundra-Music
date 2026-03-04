import { CheckCircle, Crown, Star, Shield, Building } from 'lucide-react';
import { useUserRole, AppRole } from '@/hooks/useUserRole';

interface UserBadgeProps {
  role?: AppRole;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export default function UserBadge({ role, size = 'md', showTooltip = true }: UserBadgeProps) {
  const { primaryRole, getTickColor } = useUserRole();
  const displayRole = role || primaryRole;

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const getBadgeContent = () => {
    switch (displayRole) {
      case 'premium':
        return {
          icon: CheckCircle,
          color: 'text-blue-500',
          label: 'Premium',
        };
      case 'vip':
        return {
          icon: Crown,
          color: 'text-yellow-500',
          label: 'VIP',
        };
      case 'artist':
        return {
          icon: Star,
          color: 'text-red-500',
          label: 'Artist',
        };
      case 'moderator':
        return {
          icon: Shield,
          color: 'text-gray-400',
          label: 'Moderator',
        };
      case 'business':
        return {
          icon: Building,
          color: 'text-green-500',
          label: 'Business',
        };
      case 'admin':
        return {
          icon: Crown,
          color: 'text-purple-500',
          label: 'Admin',
        };
      default:
        return null;
    }
  };

  const badge = getBadgeContent();

  if (!badge) return null;

  const Icon = badge.icon;

  return (
    <span 
      className={`inline-flex items-center ${badge.color}`}
      title={showTooltip ? badge.label : undefined}
    >
      <Icon className={`${sizeClasses[size]} fill-current`} />
    </span>
  );
}
