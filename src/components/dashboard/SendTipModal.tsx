import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Coins, MessageCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { supabase } from '@/integrations/supabase/client';
import thundraLogo from '@/assets/thundra-logo.jpg';
import ionToken from '@/assets/ion-token.png';

interface SendTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId?: string;
  recipientName?: string;
}

export default function SendTipModal({ isOpen, onClose, recipientId, recipientName }: SendTipModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [recipient, setRecipient] = useState(recipientName || '');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState<'THDR' | 'ION'>('THDR');
  const [message, setMessage] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; username: string; full_name: string | null; avatar_url: string | null }>>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<{ id: string; username: string } | null>(
    recipientId && recipientName ? { id: recipientId, username: recipientName } : null
  );

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('id, user_id, username, full_name, avatar_url')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .neq('user_id', user?.id)
      .limit(5);

    setSearchResults(data?.map(d => ({ ...d, id: d.user_id })) || []);
  };

  const handleSend = async () => {
    if (!user || !selectedRecipient || !amount) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({ title: 'Error', description: 'Please enter a valid amount', variant: 'destructive' });
      return;
    }

    const balance = token === 'THDR' ? (profile?.thdr_balance || 0) : (profile?.ion_balance || 0);
    if (amountNum > balance) {
      toast({ title: 'Insufficient Balance', description: `You don't have enough ${token}`, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Deduct from sender using profiles table
      const balanceField = token === 'THDR' ? 'thdr_balance' : 'ion_balance';
      
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ [balanceField]: balance - amountNum })
        .eq('user_id', user.id);

      if (deductError) throw deductError;

      // Add to recipient
      const { data: recipientProfile } = await supabase
        .from('profiles')
        .select(balanceField)
        .eq('user_id', selectedRecipient.id)
        .single();

      if (recipientProfile) {
        const currentBalance = (recipientProfile as any)[balanceField] || 0;
        await supabase
          .from('profiles')
          .update({ [balanceField]: currentBalance + amountNum })
          .eq('user_id', selectedRecipient.id);
      }

      // Record tip
      await supabase.from('tips').insert({
        from_user_id: user.id,
        to_artist_id: selectedRecipient.id,
        amount: amountNum,
        token_symbol: token,
        message: message || null,
      });

      // Record transaction
      await supabase.from('wallet_transactions').insert({
        from_user_id: user.id,
        to_user_id: selectedRecipient.id,
        transaction_type: 'tip',
        token_symbol: token,
        amount: amountNum,
        fee: 0,
        status: 'completed',
      });

      toast({ 
        title: 'Tip Sent! 🎉', 
        description: `Successfully sent ${amountNum} ${token} to ${selectedRecipient.username}` 
      });

      await refreshProfile();
      onClose();
      setAmount('');
      setMessage('');
      setRecipient('');
      setSelectedRecipient(null);
    } catch (error) {
      console.error('Error sending tip:', error);
      toast({ title: 'Error', description: 'Failed to send tip. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Send Tip
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Recipient Search */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Recipient</label>
            {selectedRecipient ? (
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">@{selectedRecipient.username}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedRecipient(null)}>
                  Change
                </Button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username..."
                  value={recipient}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  className="pl-9"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          setSelectedRecipient({ id: result.id, username: result.username || '' });
                          setRecipient('');
                          setSearchResults([]);
                        }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors text-left"
                      >
                        {result.avatar_url ? (
                          <img src={result.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">@{result.username}</p>
                          {result.full_name && (
                            <p className="text-xs text-muted-foreground">{result.full_name}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Token Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Token</label>
            <Select value={token} onValueChange={(v) => setToken(v as 'THDR' | 'ION')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="THDR">
                  <div className="flex items-center gap-2">
                    <img src={thundraLogo} alt="THDR" className="w-5 h-5 rounded-full" />
                    <span>THDR ({profile?.thdr_balance?.toLocaleString() || 0} available)</span>
                  </div>
                </SelectItem>
                <SelectItem value="ION">
                  <div className="flex items-center gap-2">
                    <img src={ionToken} alt="ION" className="w-5 h-5 rounded-full" />
                    <span>ION ({profile?.ion_balance?.toLocaleString() || 0} available)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount</label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {[10, 50, 100, 500].map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setAmount(String(preset))}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Message (optional)
            </label>
            <Textarea
              placeholder="Add a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            disabled={loading || !selectedRecipient || !amount}
            className="w-full"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
              />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send {amount ? `${amount} ${token}` : 'Tip'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}