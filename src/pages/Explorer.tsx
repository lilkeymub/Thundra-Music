import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, ExternalLink, Copy, TrendingUp, TrendingDown, 
  Flame, ArrowRightLeft, Clock, CheckCircle, XCircle,
  Wallet, Activity, DollarSign, Users
} from 'lucide-react';
import { Header } from '@/components/Header';
import { SharedFooter } from '@/components/SharedFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import thundraLogo from '@/assets/thundra-logo.jpg';

interface Transaction {
  id: string;
  transaction_hash: string;
  transaction_type: string;
  from_wallet_address: string | null;
  from_email: string | null;
  to_wallet_address: string | null;
  to_email: string | null;
  amount: number;
  token_symbol: string;
  fee_amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

interface BurnStats {
  total_burned: number;
  today_burned: number;
}

export default function Explorer() {
  const { toast } = useToast();
  const { getPrice, getChange } = useTokenPrices();
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchResults, setSearchResults] = useState<Transaction[] | null>(null);
  const [walletBalance, setWalletBalance] = useState<{ thdr: number; ion: number } | null>(null);
  const [burnStats, setBurnStats] = useState<BurnStats>({ total_burned: 0, today_burned: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'burns'>('transactions');

  useEffect(() => {
    fetchTransactions();
    fetchBurnStats();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions_ledger')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setTransactions(data as Transaction[]);
    }
    setLoading(false);
  };

  const fetchBurnStats = async () => {
    // Get total burned
    const { data: burnData } = await supabase
      .from('burn_records')
      .select('amount');

    if (burnData) {
      const total = burnData.reduce((sum, r) => sum + Number(r.amount), 0);
      
      // Get today's burns
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData } = await supabase
        .from('burn_records')
        .select('amount')
        .gte('burned_at', today);

      const todayBurned = todayData?.reduce((sum, r) => sum + Number(r.amount), 0) || 0;
      
      setBurnStats({ total_burned: total, today_burned: todayBurned });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setWalletBalance(null);
      return;
    }

    setLoading(true);

    // Check if searching for wallet address
    if (searchQuery.startsWith('THDR')) {
      // Search for wallet balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('thdr_balance, ion_balance')
        .eq('web3_wallet_address', searchQuery)
        .single();

      if (profile) {
        setWalletBalance({ 
          thdr: profile.thdr_balance || 0, 
          ion: profile.ion_balance || 0 
        });
      }

      // Get transactions for this wallet
      const { data: txns } = await supabase
        .from('transactions_ledger')
        .select('*')
        .or(`from_wallet_address.eq.${searchQuery},to_wallet_address.eq.${searchQuery}`)
        .order('created_at', { ascending: false })
        .limit(20);

      setSearchResults(txns as Transaction[] || []);
    } else if (searchQuery.startsWith('TXN_')) {
      // Search for specific transaction
      const { data: txn } = await supabase
        .from('transactions_ledger')
        .select('*')
        .eq('transaction_hash', searchQuery)
        .single();

      setSearchResults(txn ? [txn as Transaction] : []);
    } else {
      // Search by email
      const { data: txns } = await supabase
        .from('transactions_ledger')
        .select('*')
        .or(`from_email.ilike.%${searchQuery}%,to_email.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      setSearchResults(txns as Transaction[] || []);
    }

    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Address copied to clipboard' });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const truncateAddress = (address: string | null) => {
    if (!address) return 'System';
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'subscription': return 'text-blue-500';
      case 'tip': return 'text-green-500';
      case 'send': return 'text-purple-500';
      case 'convert': return 'text-yellow-500';
      case 'burn': return 'text-red-500';
      case 'reward': return 'text-emerald-500';
      default: return 'text-muted-foreground';
    }
  };

  const thdrPrice = getPrice('THDR');
  const thdrChange = getChange('THDR');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="text-primary">THUNDRA</span> Explorer
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transparent blockchain-style ledger for all ecosystem transactions
          </p>
        </motion.div>

        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <img src={thundraLogo} alt="THDR" className="w-6 h-6 rounded-full" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">$THDR Price</p>
                <p className="font-bold">${thdrPrice.toFixed(4)}</p>
                <p className={`text-xs ${thdrChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {thdrChange >= 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                  {' '}{thdrChange.toFixed(2)}%
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Burned</p>
                <p className="font-bold">{burnStats.total_burned.toLocaleString()} THDR</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Today Burned</p>
                <p className="font-bold">{burnStats.today_burned.toLocaleString()} THDR</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ArrowRightLeft className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="font-bold">{transactions.length}+</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 rounded-xl mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by wallet address (THDR...), transaction hash (TXN_...), or email"
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="md:w-32">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Wallet Balance Display */}
          {walletBalance && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 bg-accent/50 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-primary" />
                <span className="font-semibold">Wallet Balance</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">THDR Balance</p>
                  <p className="text-2xl font-bold text-primary">{walletBalance.thdr.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ION Balance</p>
                  <p className="text-2xl font-bold text-blue-500">{walletBalance.ion.toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'transactions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('transactions')}
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Transactions
          </Button>
          <Button
            variant={activeTab === 'burns' ? 'default' : 'outline'}
            onClick={() => setActiveTab('burns')}
          >
            <Flame className="w-4 h-4 mr-2" />
            Burn Records
          </Button>
        </div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent/50">
                <tr>
                  <th className="text-left p-4 font-medium">Transaction Hash</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">From</th>
                  <th className="text-left p-4 font-medium">To</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {(searchResults || transactions).map((tx) => (
                  <tr key={tx.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-accent px-2 py-1 rounded">
                          {tx.transaction_hash.slice(0, 16)}...
                        </code>
                        <button
                          onClick={() => copyToClipboard(tx.transaction_hash)}
                          className="p-1 hover:bg-accent rounded"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`capitalize font-medium ${getTypeColor(tx.transaction_type)}`}>
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="font-mono">{truncateAddress(tx.from_wallet_address)}</p>
                        {tx.from_email && (
                          <p className="text-xs text-muted-foreground">{tx.from_email}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="font-mono">{truncateAddress(tx.to_wallet_address)}</p>
                        {tx.to_email && (
                          <p className="text-xs text-muted-foreground">{tx.to_email}</p>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold">{tx.amount.toLocaleString()} {tx.token_symbol}</p>
                      {tx.fee_amount > 0 && (
                        <p className="text-xs text-muted-foreground">Fee: {tx.fee_amount}</p>
                      )}
                    </td>
                    <td className="p-4">
                      {tx.status === 'completed' ? (
                        <span className="flex items-center gap-1 text-green-500">
                          <CheckCircle className="w-4 h-4" /> Completed
                        </span>
                      ) : tx.status === 'failed' ? (
                        <span className="flex items-center gap-1 text-red-500">
                          <XCircle className="w-4 h-4" /> Failed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Clock className="w-4 h-4" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(tx.created_at)}
                    </td>
                  </tr>
                ))}
                {(searchResults || transactions).length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>

      <SharedFooter />
    </div>
  );
}
