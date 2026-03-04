import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Crown, Star, Check, Zap, Download, Music, 
  MessageCircle, ShoppingBag, Headphones, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import thundraLogo from '@/assets/thundra-logo.jpg';
import ionToken from '@/assets/ion-token.png';
import usdtToken from '@/assets/usdt-token.png';
import { useWallet } from '@/hooks/useWallet';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: 'free' | 'premium' | 'vip';
}

const premiumBenefits = [
  { icon: Headphones, text: 'Unlimited streaming' },
  { icon: Music, text: '2x earning multiplier' },
  { icon: Download, text: 'Audio downloads' },
  { icon: ShoppingBag, text: 'Post on Marketplace' },
  { icon: Star, text: 'Blue verified tick' },
  { icon: MessageCircle, text: 'Priority support' },
];

const vipBenefits = [
  { icon: Headphones, text: 'Everything in Premium' },
  { icon: Zap, text: '3x earning multiplier' },
  { icon: Video, text: 'Watch & download video clips' },
  { icon: Crown, text: 'Gold verified tick' },
  { icon: Star, text: 'Exclusive VIP content' },
  { icon: MessageCircle, text: 'Direct artist messaging' },
];

export default function SubscriptionModal({ isOpen, onClose, currentTier = 'free' }: SubscriptionModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { wallet } = useWallet();
  const { getPrice } = useTokenPrices();
  const { toast } = useToast();
  
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'vip' | null>(null);
  const [months, setMonths] = useState(1);
  const [selectedToken, setSelectedToken] = useState<'THDR' | 'USDT' | 'ION'>('THDR');
  const [processing, setProcessing] = useState(false);

  // Get real balances from profile
  const thdrBalance = profile?.thdr_balance || 0;
  const ionBalance = profile?.ion_balance || 0;
  const usdtBalance = wallet?.usdt_balance || 0;

  const getDiscount = (months: number): number => {
    if (months >= 10) return 0.30;
    if (months >= 6) return 0.15;
    if (months >= 3) return 0.10;
    return 0;
  };

  const calculatePrice = (basePriceUsd: number, months: number, token: string): number => {
    const discount = getDiscount(months);
    const totalUsd = basePriceUsd * months * (1 - discount);
    const tokenPrice = getPrice(token);
    return tokenPrice > 0 ? totalUsd / tokenPrice : totalUsd;
  };

  const premiumPriceUsd = 1;
  const vipPriceUsd = 3;

  const handlePurchase = async () => {
    if (!user || !selectedPlan) return;

    setProcessing(true);

    const basePrice = selectedPlan === 'premium' ? premiumPriceUsd : vipPriceUsd;
    const tokenAmount = calculatePrice(basePrice, months, selectedToken);

    // Check balance using profile data
    const currentBalance = selectedToken === 'THDR' ? thdrBalance : selectedToken === 'ION' ? ionBalance : usdtBalance;

    if (currentBalance < tokenAmount) {
      toast({
        title: 'Insufficient balance',
        description: `You need ${tokenAmount.toFixed(2)} ${selectedToken}. You have ${currentBalance.toFixed(2)} ${selectedToken}.`,
        variant: 'destructive',
      });
      setProcessing(false);
      return;
    }

    // Deduct from profiles table
    const balanceField = selectedToken === 'THDR' ? 'thdr_balance' : selectedToken === 'ION' ? 'ion_balance' : 'thdr_balance';
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ [balanceField]: currentBalance - tokenAmount })
      .eq('user_id', user.id);

    if (updateError) {
      toast({
        title: 'Transaction failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
      setProcessing(false);
      return;
    }

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + months);

    // Create subscription
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan_type: selectedPlan,
      months_purchased: months,
      price_paid: tokenAmount,
      token_used: selectedToken,
      discount_applied: getDiscount(months),
      expires_at: expiresAt.toISOString(),
    });

    // Update profile tier directly
    await supabase
      .from('profiles')
      .update({ tier: selectedPlan })
      .eq('user_id', user.id);

    // Process fee (burn 50%, partnership 50%)
    const fee = tokenAmount * 0.1;
    await supabase.from('burn_records').insert({
      token_symbol: selectedToken,
      amount: fee * 0.5,
      burn_type: 'subscription_fee',
      source_activity: 'subscription',
    });

    // Record transaction in ledger
    const { data: txn } = await supabase.from('transactions_ledger').insert({
      transaction_type: 'subscription',
      from_user_id: user.id,
      from_wallet_address: profile?.web3_wallet_address,
      from_email: profile?.email,
      to_wallet_address: 'THDR_PLATFORM_TREASURY',
      amount: tokenAmount,
      token_symbol: selectedToken,
      fee_amount: fee,
      status: 'completed',
      description: `${selectedPlan} subscription for ${months} month(s)`,
    }).select().single();

    // Create notification with explorer link
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'transaction',
      title: 'Subscription Activated! 🎉',
      message: `Your ${selectedPlan} subscription is now active for ${months} month(s).`,
      data: { 
        transaction_id: txn?.id,
        transaction_hash: (txn as any)?.transaction_hash,
        explorer_link: `/explorer?txn=${(txn as any)?.transaction_hash}`
      }
    });

    // Refresh profile to update dashboard
    await refreshProfile();

    toast({
      title: 'Subscription activated! 🎉',
      description: `You're now a ${selectedPlan === 'vip' ? 'VIP' : 'Premium'} member!`,
    });

    setProcessing(false);
    onClose();
  };

  if (!isOpen) return null;

  const showPremium = currentTier === 'free';
  const showVip = currentTier === 'free' || currentTier === 'premium';

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
          className="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {!selectedPlan ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-display font-bold">Upgrade Your Experience</h2>
                  <p className="text-muted-foreground">Choose a plan that fits your needs</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-accent rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Plans */}
              <div className="p-6 space-y-4">
                {showPremium && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="border border-blue-500/30 bg-blue-500/5 rounded-xl p-6 cursor-pointer"
                    onClick={() => setSelectedPlan('premium')}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Star className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            Premium
                            <span className="text-blue-500">✓</span>
                          </h3>
                          <p className="text-muted-foreground">For serious music lovers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">$1<span className="text-sm font-normal">/month</span></p>
                        <p className="text-xs text-green-500">Save up to 30%</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {premiumBenefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-blue-500" />
                          {benefit.text}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {showVip && (
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="border border-yellow-500/30 bg-yellow-500/5 rounded-xl p-6 cursor-pointer relative overflow-hidden"
                    onClick={() => setSelectedPlan('vip')}
                  >
                    <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
                      BEST VALUE
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <Crown className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold flex items-center gap-2">
                            VIP
                            <span className="text-yellow-500">♛</span>
                          </h3>
                          <p className="text-muted-foreground">Ultimate experience</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">$3<span className="text-sm font-normal">/month</span></p>
                        <p className="text-xs text-green-500">Save up to 30%</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {vipBenefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-yellow-500" />
                          {benefit.text}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Payment Form */}
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setSelectedPlan(null)} 
                    className="p-2 hover:bg-accent rounded-full"
                  >
                    ←
                  </button>
                  <div>
                    <h2 className="text-xl font-display font-bold capitalize">
                      {selectedPlan} Subscription
                    </h2>
                    <p className="text-muted-foreground">Complete your purchase</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-accent rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Duration */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration (months)</label>
                  <div className="flex gap-2 flex-wrap">
                    {[1, 3, 6, 12].map(m => (
                      <Button
                        key={m}
                        variant={months === m ? 'default' : 'outline'}
                        onClick={() => setMonths(m)}
                        className="relative"
                      >
                        {m} month{m > 1 ? 's' : ''}
                        {getDiscount(m) > 0 && (
                          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-1 rounded">
                            -{getDiscount(m) * 100}%
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Payment Token */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Pay with</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['THDR', 'USDT', 'ION'] as const).map(token => {
                      const balance = token === 'THDR' ? thdrBalance : token === 'ION' ? ionBalance : usdtBalance;
                      const tokenLogo = token === 'THDR' ? thundraLogo : token === 'ION' ? ionToken : usdtToken;
                      return (
                        <Button
                          key={token}
                          variant={selectedToken === token ? 'default' : 'outline'}
                          onClick={() => setSelectedToken(token)}
                          className="flex flex-col py-4 h-auto"
                        >
                          <img src={tokenLogo} alt={token} className="w-6 h-6 rounded-full mb-1" />
                          <span className="font-bold">{token}</span>
                          <span className="text-xs text-muted-foreground">
                            Balance: {balance.toFixed(2)}
                          </span>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* External Payment Methods */}
                <div className="p-4 bg-muted/50 rounded-lg border border-dashed border-muted-foreground/30">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    More payment methods coming soon
                  </p>
                  <div className="flex justify-center gap-4 items-center">
                    {/* Visa */}
                    <div className="flex items-center justify-center w-12 h-8 bg-white rounded shadow-sm">
                      <svg viewBox="0 0 48 48" className="w-10 h-6">
                        <path fill="#1565C0" d="M18.7,13.8l-2.7,14.9h3.5l2.7-14.9H18.7z"/>
                        <path fill="#1565C0" d="M27.9,13.6c-0.7-0.3-1.7-0.5-3-0.5c-3.3,0-5.7,1.7-5.7,4.1c0,1.8,1.6,2.8,2.9,3.4c1.3,0.6,1.7,1,1.7,1.5c0,0.8-1,1.2-2,1.2c-1.3,0-2-0.2-3.1-0.6l-0.4-0.2l-0.5,2.8c0.8,0.4,2.2,0.7,3.7,0.7c3.5,0,5.8-1.7,5.8-4.2c0-1.4-0.9-2.5-2.8-3.4c-1.2-0.6-1.9-1-1.9-1.5c0-0.5,0.6-1.1,1.9-1.1c1.1,0,1.9,0.2,2.5,0.5l0.3,0.1L27.9,13.6z"/>
                        <path fill="#1565C0" d="M38.7,13.8h-2.6c-0.8,0-1.4,0.2-1.7,1l-4.9,11.3h3.5l0.7-1.9h4.2l0.4,1.9h3.1L38.7,13.8z M34.6,22c0.3-0.7,1.3-3.4,1.3-3.4s0.3-0.7,0.4-1.2l0.2,1.1l0.8,3.5H34.6z"/>
                        <path fill="#1565C0" d="M12.7,13.8l-3.3,10.2l-0.3-1.7c-0.6-2-2.5-4.1-4.6-5.2l3,10.8h3.5l5.2-14.1H12.7z"/>
                        <path fill="#FFC107" d="M6.8,13.8H1.1l-0.1,0.3c4.2,1,7,3.5,8.1,6.5l-1.2-5.8C7.8,14.1,7.4,13.8,6.8,13.8z"/>
                      </svg>
                    </div>
                    {/* Mastercard */}
                    <div className="flex items-center justify-center w-12 h-8 bg-white rounded shadow-sm">
                      <svg viewBox="0 0 48 48" className="w-10 h-6">
                        <circle fill="#FF5722" cx="17" cy="24" r="10"/>
                        <circle fill="#FF9800" cx="31" cy="24" r="10"/>
                        <path fill="#FF7043" d="M24,17c2.2,2,3.5,4.9,3.5,8s-1.3,6-3.5,8c-2.2-2-3.5-4.9-3.5-8S21.8,19,24,17z"/>
                      </svg>
                    </div>
                    {/* PayPal */}
                    <div className="flex items-center justify-center w-12 h-8 bg-white rounded shadow-sm">
                      <svg viewBox="0 0 48 48" className="w-10 h-6">
                        <path fill="#1565C0" d="M18.7,31.5H16l0.4-2.7h2.7c0.9,0,1.6-0.7,1.8-1.6l0,0c0.2-0.9-0.4-1.6-1.3-1.6h-2.7l0.7-4.4h4c2.5,0,4.2,2.1,3.7,4.6C25,28.7,22.1,31.5,18.7,31.5z"/>
                        <path fill="#039BE5" d="M32.5,13.5h-4.6l-0.7,4.4h2.7c0.9,0,1.5,0.8,1.3,1.6c-0.2,0.9-0.9,1.6-1.8,1.6h-2.7l-0.4,2.7h4.3c3.4,0,6.3-2.8,6.8-6.2C38,14.7,35.9,13.5,32.5,13.5z"/>
                      </svg>
                    </div>
                    {/* Web3 Wallet */}
                    <div className="flex items-center justify-center w-12 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded shadow-sm">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-accent/50 rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <span>Base price</span>
                    <span>${(selectedPlan === 'premium' ? premiumPriceUsd : vipPriceUsd) * months}</span>
                  </div>
                  {getDiscount(months) > 0 && (
                    <div className="flex justify-between mb-2 text-green-500">
                      <span>Discount ({getDiscount(months) * 100}%)</span>
                      <span>-${((selectedPlan === 'premium' ? premiumPriceUsd : vipPriceUsd) * months * getDiscount(months)).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                    <span>Total ({selectedToken})</span>
                    <span>
                      {calculatePrice(
                        selectedPlan === 'premium' ? premiumPriceUsd : vipPriceUsd,
                        months,
                        selectedToken
                      ).toFixed(2)} {selectedToken}
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handlePurchase}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Complete Purchase'}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
