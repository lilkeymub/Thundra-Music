import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, Copy, ExternalLink, History, CheckCircle, Send, Gift, Coins, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import { supabase } from '@/integrations/supabase/client';
import thundraLogo from '@/assets/thundra-logo.jpg';
import ionToken from '@/assets/ion-token.png';
import usdtToken from '@/assets/usdt-token.png';
import SendTipModal from './SendTipModal';
import ConvertModal from './ConvertModal';
import PriceTracker from './PriceTracker';

interface Transaction {
  id: string;
  type: string;
  description: string;
  amount: string;
  date: string;
  token: string;
}

interface LedgerTransaction {
  id: string;
  transaction_hash: string;
  type: string;
  description: string;
  amount: string;
  date: string;
  token: string;
}

export default function WalletSection() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { wallet, transactions: walletTransactions } = useWallet();
  const { getPrice, getChange } = useTokenPrices();
  const [activeModal, setActiveModal] = useState<'deposit' | 'withdraw' | 'send' | null>(null);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [sendTipOpen, setSendTipOpen] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<LedgerTransaction[]>([]);
  const [sendAmount, setSendAmount] = useState('');
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendToken, setSendToken] = useState<'THDR' | 'ION'>('THDR');

  const walletAddress = profile?.web3_wallet_address || '0x1234...5678';

  // Fetch transactions from ledger
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!profile?.user_id) return;
      
      const { data } = await supabase
        .from('transactions_ledger')
        .select('*')
        .or(`from_user_id.eq.${profile.user_id},to_user_id.eq.${profile.user_id}`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        const formatted = data.map((tx: any) => ({
          id: tx.id,
          transaction_hash: tx.transaction_hash,
          type: tx.transaction_type,
          description: getTransactionDescription(tx.transaction_type, tx.from_user_id === profile.user_id),
          amount: `${tx.from_user_id === profile.user_id ? '-' : '+'}${tx.amount} ${tx.token_symbol}`,
          date: formatDate(tx.created_at),
          token: tx.token_symbol,
        }));
        setRecentTransactions(formatted);
      }
    };
    
    fetchTransactions();
  }, [profile]);

  const getTransactionDescription = (type: string, isOutgoing: boolean): string => {
    switch (type) {
      case 'tip': return isOutgoing ? 'Sent tip' : 'Received tip';
      case 'transfer': return isOutgoing ? 'Sent tokens' : 'Received tokens';
      case 'reward': return 'Activity reward';
      case 'conversion': return 'Token conversion';
      case 'login_bonus': return 'Daily login bonus';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({ title: "Copied!", description: "Wallet address copied to clipboard" });
  };

  // Token prices
  const thdrPrice = getPrice('THDR');
  const ionPrice = getPrice('ION');
  const thdrChange = getChange('THDR');
  const ionChange = getChange('ION');

  const handleSendTokens = async () => {
    if (!sendRecipient || !sendAmount) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    const amount = parseFloat(sendAmount);
    const balance = sendToken === 'THDR' ? (profile?.thdr_balance || 0) : (profile?.ion_balance || 0);

    if (amount > balance) {
      toast({ title: "Insufficient Balance", description: `You don't have enough ${sendToken}`, variant: "destructive" });
      return;
    }

    // Find recipient by username or wallet address
    const { data: recipient } = await supabase
      .from('profiles')
      .select('user_id')
      .or(`username.eq.${sendRecipient},web3_wallet_address.eq.${sendRecipient}`)
      .single();

    if (!recipient) {
      toast({ title: "Error", description: "Recipient not found", variant: "destructive" });
      return;
    }

    // Perform transfer using profiles table
    const balanceField = sendToken === 'THDR' ? 'thdr_balance' : 'ion_balance';
    
    const { error: deductError } = await supabase
      .from('profiles')
      .update({ [balanceField]: balance - amount })
      .eq('user_id', profile?.user_id);

    if (deductError) {
      toast({ title: "Error", description: "Transfer failed", variant: "destructive" });
      return;
    }

    // Add to recipient
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select(balanceField)
      .eq('user_id', recipient.user_id)
      .single();

    if (recipientProfile) {
      const recipientBalance = (recipientProfile as any)[balanceField] || 0;
      await supabase
        .from('profiles')
        .update({ [balanceField]: recipientBalance + amount })
        .eq('user_id', recipient.user_id);
    }

    // Record transaction in ledger
    const { data: txn } = await supabase.from('transactions_ledger').insert({
      transaction_type: 'transfer',
      from_user_id: profile?.user_id,
      from_wallet_address: profile?.web3_wallet_address,
      from_email: profile?.email,
      to_user_id: recipient.user_id,
      amount,
      token_symbol: sendToken,
      fee_amount: 0,
      status: 'completed',
      description: `Sent ${amount} ${sendToken}`,
    }).select().single();

    // Create notifications
    if (txn) {
      await supabase.from('notifications').insert([
        {
          user_id: profile?.user_id,
          type: 'transaction',
          title: 'Tokens Sent',
          message: `You sent ${amount} ${sendToken}`,
          data: { transaction_id: txn.id, transaction_hash: (txn as any).transaction_hash, explorer_link: `/explorer?txn=${(txn as any).transaction_hash}` }
        },
        {
          user_id: recipient.user_id,
          type: 'transaction',
          title: 'Tokens Received',
          message: `You received ${amount} ${sendToken}`,
          data: { transaction_id: txn.id, transaction_hash: (txn as any).transaction_hash, explorer_link: `/explorer?txn=${(txn as any).transaction_hash}` }
        }
      ]);
    }

    toast({ title: "Success!", description: `Sent ${amount} ${sendToken} successfully` });
    await refreshProfile();
    setActiveModal(null);
    setSendAmount('');
    setSendRecipient('');
  };

  // Use profile balances as primary source
  const thdrBalance = profile?.thdr_balance || wallet?.thdr_balance || 0;
  const ionBalance = profile?.ion_balance || wallet?.ion_balance || 0;
  const usdtBalance = wallet?.usdt_balance || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-display font-bold flex items-center gap-2">
        <Wallet className="w-6 h-6 text-primary" />
        Your Wallet
      </h2>

      {/* Balances */}
      {/* Live Price Trackers */}
      <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
        <PriceTracker token="THDR" />
        <PriceTracker token="ION" />
      </div>

      {/* Balances */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-xl bg-gradient-to-br from-primary/20 to-background"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">$THDR Balance</h3>
            <img src={thundraLogo} alt="THDR" className="w-8 h-8 rounded-full" />
          </div>
          <p className="text-4xl font-display font-bold text-primary mb-1">
            {thdrBalance.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">≈ ${(thdrBalance * thdrPrice).toFixed(2)} USD</p>
          <motion.div 
            className={`flex items-center gap-2 mt-4 text-sm ${thdrChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5 }}
          >
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              thdrChange >= 0 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-red-500/20 text-red-500'
            }`}>
              {thdrChange >= 0 ? '+' : ''}{thdrChange.toFixed(2)}%
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-background"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">ION Balance</h3>
            <img src={ionToken} alt="ION" className="w-8 h-8 rounded-full" />
          </div>
          <p className="text-4xl font-display font-bold text-blue-400 mb-1">
            {ionBalance.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">≈ ${(ionBalance * ionPrice).toFixed(2)} USD</p>
          <motion.div 
            className={`flex items-center gap-2 mt-4 text-sm ${ionChange >= 0 ? 'text-green-500' : 'text-red-500'}`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.5 }}
          >
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
              ionChange >= 0 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-red-500/20 text-red-500'
            }`}>
              {ionChange >= 0 ? '+' : ''}{ionChange.toFixed(2)}%
            </span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-xl bg-gradient-to-br from-emerald-500/20 to-background"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">USDT Balance</h3>
            <img src={usdtToken} alt="USDT" className="w-8 h-8" />
          </div>
          <p className="text-4xl font-display font-bold text-emerald-400 mb-1">
            {usdtBalance.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">≈ ${usdtBalance.toFixed(2)} USD</p>
          <div className="flex items-center gap-2 mt-4 text-sm text-emerald-400">
            <span className="text-muted-foreground">1 USDT = $1.00 (stable)</span>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Button 
          onClick={() => setActiveModal('deposit')}
          className="flex-col h-auto py-4 bg-green-600 hover:bg-green-700"
        >
          <ArrowDownLeft className="w-5 h-5 mb-1" />
          <span>Deposit</span>
        </Button>
        <Button 
          onClick={() => setActiveModal('withdraw')}
          variant="outline" 
          className="flex-col h-auto py-4"
        >
          <ArrowUpRight className="w-5 h-5 mb-1" />
          <span>Withdraw</span>
        </Button>
        <Button 
          onClick={() => setConvertModalOpen(true)}
          className="flex-col h-auto py-4 bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <RefreshCw className="w-5 h-5 mb-1" />
          <span>Convert</span>
        </Button>
        <Button 
          onClick={() => setActiveModal('send')}
          variant="outline" 
          className="flex-col h-auto py-4"
        >
          <Send className="w-5 h-5 mb-1" />
          <span>Send</span>
        </Button>
        <Button 
          onClick={() => setSendTipOpen(true)}
          className="flex-col h-auto py-4 bg-gradient-to-r from-primary to-orange-500"
        >
          <Gift className="w-5 h-5 mb-1" />
          <span>Tip Artist</span>
        </Button>
      </div>

      {/* Wallet Address */}
      <div className="glass-card p-4 rounded-xl">
        <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 p-3 bg-secondary rounded-lg text-sm font-mono truncate">
            {walletAddress}
          </code>
          <Button size="icon" variant="outline" onClick={copyAddress}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="outline">
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History
          </h3>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <div className="divide-y divide-border">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-accent/30 transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  tx.amount.startsWith('+') ? 'bg-green-500/20 text-green-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {tx.amount.startsWith('+') ? <ArrowDownLeft className="w-5 h-5" /> :
                   <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-sm text-muted-foreground">{tx.date}</p>
                </div>
                <span className={`font-bold ${
                  tx.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'
                }`}>
                  {tx.amount}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Coins className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Start earning by streaming music!</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Dialog open={activeModal === 'deposit'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deposit THDR</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-muted-foreground text-sm">
              Send THDR tokens to your wallet address. Make sure to use the correct network.
            </p>
            <div className="p-4 bg-secondary rounded-lg text-center">
              <p className="text-xs text-muted-foreground mb-2">Your Deposit Address</p>
              <code className="text-sm font-mono break-all">{walletAddress}</code>
            </div>
            <Button onClick={copyAddress} className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              Copy Address
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === 'withdraw'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-muted-foreground">Withdrawal Method</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button variant="outline" className="flex flex-col items-center py-4 h-auto">
                  <span className="text-lg mb-1">🔗</span>
                  <span className="text-xs">Crypto Wallet</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center py-4 h-auto opacity-50" disabled>
                  <span className="text-lg mb-1">🌍</span>
                  <span className="text-xs">WorldRemit</span>
                  <span className="text-[10px] text-primary">Coming Soon</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center py-4 h-auto opacity-50" disabled>
                  <span className="text-lg mb-1">💳</span>
                  <span className="text-xs">PayPal</span>
                  <span className="text-[10px] text-primary">Coming Soon</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center py-4 h-auto opacity-50" disabled>
                  <span className="text-lg mb-1">🏦</span>
                  <span className="text-xs">Bank Transfer</span>
                  <span className="text-[10px] text-primary">Coming Soon</span>
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Amount</label>
              <Input type="number" placeholder="Enter amount" className="mt-1" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Destination Address</label>
              <Input placeholder="0x..." className="mt-1" />
            </div>
            <Button className="w-full">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm Withdrawal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeModal === 'send'} onOpenChange={() => setActiveModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Tokens</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-muted-foreground">Token</label>
              <Select value={sendToken} onValueChange={(v) => setSendToken(v as 'THDR' | 'ION')}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="THDR">THDR ({thdrBalance.toLocaleString()})</SelectItem>
                  <SelectItem value="ION">ION ({ionBalance.toLocaleString()})</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Recipient (username or wallet)</label>
              <Input 
                placeholder="@username or 0x..." 
                value={sendRecipient}
                onChange={(e) => setSendRecipient(e.target.value)}
                className="mt-1" 
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Amount</label>
              <Input 
                type="number" 
                placeholder="Enter amount" 
                value={sendAmount}
                onChange={(e) => setSendAmount(e.target.value)}
                className="mt-1" 
              />
            </div>
            <Button onClick={handleSendTokens} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Send Tokens
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tip Modal */}
      <SendTipModal isOpen={sendTipOpen} onClose={() => setSendTipOpen(false)} />
      
      {/* Convert Modal */}
      <ConvertModal isOpen={convertModalOpen} onClose={() => setConvertModalOpen(false)} />
    </div>
  );
}