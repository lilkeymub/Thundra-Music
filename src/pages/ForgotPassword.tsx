import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import thundraLogo from '@/assets/thundra-logo.jpg';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({ title: "Error", description: "Please enter your email address", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    setLoading(false);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEmailSent(true);
      toast({ title: "Email Sent!", description: "Check your inbox for the password reset link." });
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="glass-card p-8 rounded-2xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
            >
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
            <p className="text-muted-foreground mb-6">
              We've sent a password reset link to <strong className="text-foreground">{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setEmailSent(false)} 
                variant="outline" 
                className="w-full"
              >
                Send Again
              </Button>
              <Button 
                onClick={() => navigate('/auth?mode=login')} 
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 rounded-2xl shadow-2xl border border-border/50">
          <button
            onClick={() => navigate('/auth?mode=login')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>

          <div className="flex flex-col items-center mb-8">
            <img src={thundraLogo} alt="Thundra" className="w-16 h-16 rounded-xl mb-4" />
            <h1 className="text-2xl font-display font-bold">
              <span className="text-primary">THUNDRA</span> MUSIC
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Reset your password</p>
          </div>

          <p className="text-sm text-muted-foreground mb-6 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSendResetEmail} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
