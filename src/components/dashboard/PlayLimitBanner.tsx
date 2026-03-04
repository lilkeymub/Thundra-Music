import { motion } from 'framer-motion';
import { Music, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useAuth } from '@/hooks/useAuth';

interface PlayLimitBannerProps {
  remainingPlays: number;
  totalPlays: number;
}

export default function PlayLimitBanner({ remainingPlays, totalPlays }: PlayLimitBannerProps) {
  const { user } = useAuth();
  const { openAuthModal } = useAuthModal();

  if (remainingPlays === Infinity) return null;

  const usedPlays = totalPlays - remainingPlays;
  const percentage = (usedPlays / totalPlays) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 rounded-xl mb-6"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          <span className="font-medium">Daily Plays</span>
        </div>
        <span className={`text-sm font-bold ${remainingPlays === 0 ? 'text-red-500' : 'text-primary'}`}>
          {remainingPlays} / {totalPlays} remaining
        </span>
      </div>
      
      <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={`h-full rounded-full ${
            percentage >= 100 ? 'bg-red-500' : percentage >= 80 ? 'bg-yellow-500' : 'bg-primary'
          }`}
        />
      </div>

      {remainingPlays === 0 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-red-400">You've reached your daily limit</p>
          <Button 
            size="sm" 
            onClick={() => openAuthModal({ mode: 'signup', message: 'Upgrade to Premium for unlimited plays!' })}
          >
            <Zap className="w-4 h-4 mr-1" />
            Go Premium
          </Button>
        </div>
      ) : remainingPlays <= 2 ? (
        <p className="text-sm text-yellow-400">
          {!user ? 'Sign up for more plays tomorrow!' : 'Running low on plays today!'}
        </p>
      ) : null}
    </motion.div>
  );
}
