import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, ArrowDownUp, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import { useToast } from '@/hooks/use-toast';
import thundraLogo from '@/assets/thundra-logo.jpg';
import ionToken from '@/assets/ion-token.png';
import usdtToken from '@/assets/usdt-token.png';

interface ConvertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tokenIcons: Record<string, string> = {
  THDR: thundraLogo,
  ION: ionToken,
  USDT: usdtToken
};

const conversionPairs = [
  { from: 'ION', to: 'THDR', label: 'ION → THDR' },
  { from: 'THDR', to: 'ION', label: 'THDR → ION' },
  { from: 'THDR', to: 'USDT', label: 'THDR → USDT' },
  { from: 'USDT', to: 'THDR', label: 'USDT → THDR' },
  { from: 'USDT', to: 'ION', label: 'USDT → ION' },
  { from: 'ION', to: 'USDT', label: 'ION → USDT' },
];

export default function ConvertModal({ isOpen, onClose }: ConvertModalProps) {
  const { profile, refreshProfile } = useAuth();
  const { wallet, convertTokens } = useWallet();
  const { getPrice, getChange } = useTokenPrices();
  const { toast } = useToast();
  
  const [fromToken, setFromToken] = useState<string>('ION');
  const [toToken, setToToken] = useState<string>('THDR');
  const [amount, setAmount] = useState('');
  const [converting, setConverting] = useState(false);

  const handlePairChange = (value: string) => {
    const pair = conversionPairs.find(p => p.label === value);
    if (pair) {
      setFromToken(pair.from);
      setToToken(pair.to);
    }
  };

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const getBalance = (token: string): number => {
    if (token === 'THDR') return profile?.thdr_balance || 0;
    if (token === 'ION') return profile?.ion_balance || 0;
    if (token === 'USDT') return wallet?.usdt_balance || 0;
    return 0;
  };

  const calculateOutput = (): number => {
    if (!amount || isNaN(Number(amount))) return 0;
    
    const fromPrice = getPrice(fromToken);
    const toPrice = getPrice(toToken);
    
    if (fromPrice === 0 || toPrice === 0) return 0;
    
    // Convert based on prices with 0.3% fee
    const inputValue = Number(amount) * fromPrice;
    const outputAmount = (inputValue / toPrice) * 0.997;
    
    return outputAmount;
  };

  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({ title: "Error", description: "Please enter a valid amount", variant: "destructive" });
      return;
    }

    const balance = getBalance(fromToken);
    if (Number(amount) > balance) {
      toast({ title: "Insufficient Balance", description: `You don't have enough ${fromToken}`, variant: "destructive" });
      return;
    }

    setConverting(true);
    const success = await convertTokens(fromToken, toToken, Number(amount));
    
    if (success) {
      await refreshProfile();
      setAmount('');
      toast({ title: "Conversion Successful! 🎉", description: `Converted ${amount} ${fromToken} to ${calculateOutput().toFixed(4)} ${toToken}` });
    }
    setConverting(false);
  };

  if (!isOpen) return null;

  const fromChange = getChange(fromToken);
  const toChange = getChange(toToken);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-2xl max-w-md w-full overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">Convert Tokens</h2>
                <p className="text-sm text-muted-foreground">Swap between tokens</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-accent rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Conversion Pair Selector */}
            <div>
              <label className="text-sm font-medium mb-2 block">Conversion Pair</label>
              <Select 
                value={`${fromToken} → ${toToken}`} 
                onValueChange={handlePairChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pair" />
                </SelectTrigger>
                <SelectContent>
                  {conversionPairs.map(pair => (
                    <SelectItem key={pair.label} value={pair.label}>
                      <div className="flex items-center gap-2">
                        <img src={tokenIcons[pair.from]} alt={pair.from} className="w-5 h-5 rounded-full" />
                        <span>{pair.label}</span>
                        <img src={tokenIcons[pair.to]} alt={pair.to} className="w-5 h-5 rounded-full" />
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Token */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">From</label>
                <span className="text-xs text-muted-foreground">
                  Balance: {getBalance(fromToken).toLocaleString()} {fromToken}
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <img src={tokenIcons[fromToken]} alt={fromToken} className="w-6 h-6 rounded-full" />
                  <span className="font-medium">{fromToken}</span>
                </div>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-24 pr-20 text-right text-lg font-medium"
                />
                <button 
                  onClick={() => setAmount(getBalance(fromToken).toString())}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
                >
                  MAX
                </button>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  ≈ ${(Number(amount || 0) * getPrice(fromToken)).toFixed(2)}
                </span>
                <span className={`flex items-center gap-1 ${fromChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {fromChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(fromChange).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={swapTokens}
                className="p-3 bg-accent rounded-full hover:bg-accent/80 transition-colors"
              >
                <ArrowDownUp className="w-5 h-5" />
              </button>
            </div>

            {/* To Token */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">To (estimated)</label>
                <span className="text-xs text-muted-foreground">
                  Balance: {getBalance(toToken).toLocaleString()} {toToken}
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <img src={tokenIcons[toToken]} alt={toToken} className="w-6 h-6 rounded-full" />
                  <span className="font-medium">{toToken}</span>
                </div>
                <Input
                  type="text"
                  value={calculateOutput().toFixed(4)}
                  readOnly
                  className="pl-24 text-right text-lg font-medium bg-muted/50"
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  ≈ ${(calculateOutput() * getPrice(toToken)).toFixed(2)}
                </span>
                <span className={`flex items-center gap-1 ${toChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {toChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(toChange).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Rate Info */}
            <div className="bg-accent/50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate</span>
                <span>1 {fromToken} = {(getPrice(fromToken) / getPrice(toToken)).toFixed(6)} {toToken}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span className="text-primary">0.3%</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Fees are burned to increase token value</span>
              </div>
            </div>

            {/* Convert Button */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleConvert}
              disabled={converting || !amount || Number(amount) <= 0}
            >
              {converting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Convert {fromToken} to {toToken}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
