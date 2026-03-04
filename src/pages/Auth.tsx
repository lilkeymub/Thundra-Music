import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, Globe, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import thundraLogo from '@/assets/thundra-logo.jpg';

type AuthMode = 'login' | 'signup';

interface SocialProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WalletIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
  </svg>
);

const socialProviders: SocialProvider[] = [
  { id: 'google', name: 'Google', icon: <GoogleIcon />, available: false },
  { id: 'apple', name: 'Apple', icon: <AppleIcon />, available: false },
  { id: 'facebook', name: 'Facebook', icon: <FacebookIcon />, available: false },
  { id: 'twitter', name: 'X', icon: <XIcon />, available: false },
  { id: 'web3', name: 'Web3 Wallet', icon: <WalletIcon />, available: false },
];

const countries = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", 
  "Japan", "Brazil", "India", "Nigeria", "South Africa", "Kenya", "Ghana",
  "Democratic Republic of Congo", "Rwanda", "Uganda", "Tanzania", "Ethiopia"
];

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [roleSelection, setRoleSelection] = useState<'none' | 'artist' | 'moderator'>('none');
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Redirect based on user tier
        setTimeout(() => {
          redirectBasedOnTier(session.user.id);
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        redirectBasedOnTier(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const redirectBasedOnTier = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('user_id', userId)
      .single();

    const tier = profile?.tier || 'free';
    
    switch (tier) {
      case 'admin':
        navigate('/dashboard/admin');
        break;
      case 'staff':
        navigate('/dashboard/staff');
        break;
      case 'moderator':
        navigate('/dashboard/moderator');
        break;
      case 'artist':
        navigate('/dashboard/artist');
        break;
      case 'vip':
        navigate('/dashboard/vip');
        break;
      case 'premium':
        navigate('/dashboard/premium');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    // Check if input is email or username
    const isEmail = email.includes('@');
    let loginEmail = email;
    
    if (!isEmail) {
      // Look up email by username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', email.toLowerCase())
        .single();
      
      if (profileError || !profileData?.email) {
        setLoading(false);
        toast({ title: "Login Failed", description: "Username not found", variant: "destructive" });
        return;
      }
      loginEmail = profileData.email;
    }
    
    // Check for admin credentials (hardcoded as per requirement)
    const adminCredentials = [
      { email: 'lilian@thundra.com', username: 'lilymub', password: 'admin1' },
      { email: 'loic@thundra.com', username: 'loic', password: 'admin2' },
      { email: 'isaac@thundra.com', username: 'isaac', password: 'admin3' },
      { email: 'jedidia@thundra.com', username: 'jedidia', password: 'admin4' },
    ];
    
    const isAdmin = adminCredentials.find(
      cred => (cred.email === loginEmail.toLowerCase() || cred.username === email.toLowerCase()) && cred.password === password
    );
    
    if (isAdmin) {
      // For admin, we still need to authenticate through Supabase
      // If admin account doesn't exist yet, we need to let them know
      const { error } = await supabase.auth.signInWithPassword({ 
        email: isAdmin.email, 
        password: password 
      });
      
      if (error) {
        // Try to sign up the admin if they don't exist
        if (error.message.includes('Invalid login credentials')) {
          toast({ 
            title: "Admin Setup Required", 
            description: "Please contact system administrator to set up admin accounts.",
            variant: "destructive" 
          });
        } else {
          toast({ title: "Login Failed", description: error.message, variant: "destructive" });
        }
      }
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
    setLoading(false);

    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !username) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (!agreeToTerms) {
      toast({ title: "Error", description: "You must agree to the terms and conditions", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setLoading(false);
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
      return;
    }

    // Update profile with additional info
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username,
          phone,
          country,
          date_of_birth: dateOfBirth || null,
          is_artist_pending: roleSelection === 'artist',
          is_moderator_pending: roleSelection === 'moderator',
        })
        .eq('user_id', data.user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }
    }

    setLoading(false);
    toast({ title: "Welcome to Thundra!", description: "Your account has been created successfully." });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 rounded-2xl shadow-2xl border border-border/50">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <motion.img
              src={thundraLogo}
              alt="Thundra Music"
              className="w-16 h-16 rounded-xl mb-4"
              whileHover={{ scale: 1.05 }}
            />
            <h1 className="text-2xl font-display font-bold">
              <span className="text-primary">THUNDRA</span> MUSIC
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === 'login' ? 'Welcome back!' : 'Join the revolution'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-secondary rounded-lg p-1 mb-6">
            {(['login', 'signup'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  mode === m 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Social Providers */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {socialProviders.map((provider) => (
              <div key={provider.id} className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onMouseEnter={() => setHoveredProvider(provider.id)}
                  onMouseLeave={() => setHoveredProvider(null)}
                  className="w-full aspect-square flex items-center justify-center rounded-lg bg-secondary hover:bg-secondary/80 transition-colors relative"
                  disabled={!provider.available}
                >
                  {provider.icon}
                </motion.button>
                <AnimatePresence>
                  {hoveredProvider === provider.id && !provider.available && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-50"
                    >
                      Coming Soon
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-8"
                          placeholder="johndoe"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="dob"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Select your country</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label htmlFor="email">{mode === 'login' ? 'Email or Username *' : 'Email *'}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type={mode === 'login' ? 'text' : 'email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder={mode === 'login' ? 'email or @username' : 'you@example.com'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="space-y-2">
                    <p className="text-sm font-medium">I want to become (optional):</p>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="artist"
                        checked={roleSelection === 'artist'}
                        onCheckedChange={(checked) => {
                          setRoleSelection(checked ? 'artist' : 'none');
                        }}
                      />
                      <label htmlFor="artist" className="text-sm text-muted-foreground cursor-pointer">
                        An Artist
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="moderator"
                        checked={roleSelection === 'moderator'}
                        onCheckedChange={(checked) => {
                          setRoleSelection(checked ? 'moderator' : 'none');
                        }}
                      />
                      <label htmlFor="moderator" className="text-sm text-muted-foreground cursor-pointer">
                        A Moderator
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreeToTerms}
                      onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                      I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
                      <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Login' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              <a href="/forgot-password" className="text-primary hover:underline">Forgot your password?</a>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing, you agree to Thundra Music's Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
