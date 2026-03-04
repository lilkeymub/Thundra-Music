import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Flag, AlertTriangle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'post' | 'message' | 'comment' | 'track' | 'user' | 'artist' | 'moderator';
  contentId?: string;
  reportedUserId?: string;
}

const reportReasons = {
  post: [
    { value: 'spam', label: 'Spam or misleading' },
    { value: 'harassment', label: 'Harassment or bullying' },
    { value: 'hate_speech', label: 'Hate speech' },
    { value: 'violence', label: 'Violence or dangerous content' },
    { value: 'nudity', label: 'Nudity or sexual content' },
    { value: 'copyright', label: 'Copyright violation' },
    { value: 'other', label: 'Other' },
  ],
  message: [
    { value: 'spam', label: 'Spam or scam' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'threats', label: 'Threats or violence' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'other', label: 'Other' },
  ],
  comment: [
    { value: 'spam', label: 'Spam' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'hate_speech', label: 'Hate speech' },
    { value: 'other', label: 'Other' },
  ],
  track: [
    { value: 'copyright', label: 'Copyright violation' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'misleading', label: 'Misleading information' },
    { value: 'other', label: 'Other' },
  ],
  user: [
    { value: 'fake_account', label: 'Fake or impersonation account' },
    { value: 'harassment', label: 'Harassment or bullying' },
    { value: 'spam', label: 'Spam behavior' },
    { value: 'scam', label: 'Scam or fraud' },
    { value: 'other', label: 'Other' },
  ],
  artist: [
    { value: 'fake_artist', label: 'Fake or impersonation' },
    { value: 'copyright', label: 'Copyright violations' },
    { value: 'misconduct', label: 'Professional misconduct' },
    { value: 'other', label: 'Other' },
  ],
  moderator: [
    { value: 'abuse_power', label: 'Abuse of power' },
    { value: 'unfair_action', label: 'Unfair moderation action' },
    { value: 'bias', label: 'Biased behavior' },
    { value: 'misconduct', label: 'Misconduct' },
    { value: 'other', label: 'Other' },
  ],
};

export default function ReportModal({ 
  isOpen, 
  onClose, 
  contentType, 
  contentId,
  reportedUserId 
}: ReportModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast({ title: 'Error', description: 'Please select a reason', variant: 'destructive' });
      return;
    }

    if (!user) {
      toast({ title: 'Error', description: 'Please sign in to submit a report', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId || null,
        content_type: contentType,
        content_id: contentId || null,
        reason,
        description: description.trim() || null,
        status: 'pending'
      });

    if (error) {
      toast({ title: 'Error', description: 'Failed to submit report', variant: 'destructive' });
    } else {
      toast({ 
        title: 'Report Submitted', 
        description: 'Thank you for helping keep Thundra safe. Our team will review your report.' 
      });
      setReason('');
      setDescription('');
      onClose();
    }

    setSubmitting(false);
  };

  if (!isOpen) return null;

  const reasons = reportReasons[contentType] || reportReasons.post;
  const titles = {
    post: 'Report Post',
    message: 'Report Message',
    comment: 'Report Comment',
    track: 'Report Track',
    user: 'Report User',
    artist: 'Report Artist',
    moderator: 'Report Moderator',
  };

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
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card rounded-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Flag className="w-5 h-5 text-red-500" />
              </div>
              <h2 className="text-xl font-display font-bold">{titles[contentType]}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-accent rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Warning */}
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mb-4">
            <div className="flex gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                False reports may result in action against your account. Please only report genuine violations.
              </p>
            </div>
          </div>

          {/* Reason Selection */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Why are you reporting this {contentType}?
              </Label>
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-2">
                {reasons.map((r) => (
                  <div key={r.value} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value={r.value} id={r.value} />
                    <Label htmlFor={r.value} className="cursor-pointer flex-1">{r.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Additional details (optional)
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide any additional context that might help our review..."
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!reason || submitting}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              {submitting ? 'Submitting...' : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
