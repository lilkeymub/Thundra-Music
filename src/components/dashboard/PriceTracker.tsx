import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import thundraLogo from '@/assets/thundra-logo.jpg';
import ionToken from '@/assets/ion-token.png';
import usdtToken from '@/assets/usdt-token.png';

interface PriceTrackerProps {
  token: string;
  showAmount?: number;
  compact?: boolean;
}

const tokenIcons: Record<string, string> = {
  THDR: thundraLogo,
  ION: ionToken,
  USDT: usdtToken
};

export default function PriceTracker({ token, showAmount, compact = false }: PriceTrackerProps) {
  const { getPrice, getChange, loading } = useTokenPrices();

  const price = getPrice(token);
  const change = getChange(token);
  const isPositive = change >= 0;
  const usdValue = showAmount ? showAmount * price : null;

  if (loading) {
    return (
      <div className="animate-pulse bg-muted h-4 w-16 rounded" />
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-sm">
        <span className="font-medium">${price.toFixed(4)}</span>
        <motion.span
          animate={{ 
            color: isPositive ? '#22c55e' : '#ef4444',
          }}
          className={`text-xs flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change).toFixed(2)}%
        </motion.span>
      </div>
    );
  }

  return (
    <motion.div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5"
      animate={{
        boxShadow: isPositive 
          ? '0 0 20px rgba(34, 197, 94, 0.2)'
          : '0 0 20px rgba(239, 68, 68, 0.2)',
      }}
      transition={{ duration: 0.5 }}
    >
      <img src={tokenIcons[token] || thundraLogo} alt={token} className="w-5 h-5 rounded-full" />
      <span className="font-medium">{token}</span>
      <span className="text-lg font-bold">${price.toFixed(4)}</span>
      
      <motion.div
        initial={{ scale: 1 }}
        animate={{ 
          scale: [1, 1.1, 1],
          color: isPositive ? '#22c55e' : '#ef4444',
        }}
        transition={{ duration: 0.5 }}
        className={`flex items-center gap-0.5 text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
      </motion.div>

      {usdValue !== null && (
        <span className="text-muted-foreground text-sm ml-2">
          ≈ ${usdValue.toFixed(2)}
        </span>
      )}
    </motion.div>
  );
}
