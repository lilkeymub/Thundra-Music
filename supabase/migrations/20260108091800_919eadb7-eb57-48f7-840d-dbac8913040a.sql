-- Create artist_applications table for users applying to become artists
CREATE TABLE public.artist_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_name TEXT NOT NULL,
  genre TEXT NOT NULL,
  bio TEXT,
  portfolio_urls TEXT[],
  sample_track_url TEXT,
  social_links JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Create moderator_applications table for users applying to become moderators
CREATE TABLE public.moderator_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  motivation TEXT NOT NULL,
  experience TEXT,
  languages TEXT[],
  availability_hours INTEGER DEFAULT 10,
  timezone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Create tips table for tipping artists
CREATE TABLE public.tips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL,
  to_artist_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  token_symbol TEXT NOT NULL DEFAULT 'THDR',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create artist_earnings table to track artist revenue
CREATE TABLE public.artist_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  earning_type TEXT NOT NULL, -- 'stream', 'tip', 'nft_sale', 'merch'
  amount NUMERIC NOT NULL,
  token_symbol TEXT NOT NULL DEFAULT 'THDR',
  reference_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_achievements table for gamification
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  reward_amount NUMERIC DEFAULT 0,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_type)
);

-- Create reward_multipliers table to define role-based multipliers
CREATE TABLE public.reward_multipliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role TEXT NOT NULL UNIQUE,
  multiplier NUMERIC NOT NULL DEFAULT 1.0,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default reward multipliers
INSERT INTO public.reward_multipliers (role, multiplier, description) VALUES
  ('free', 1.0, 'Base multiplier for free users'),
  ('premium', 1.5, '50% bonus for premium users'),
  ('vip', 2.0, '100% bonus for VIP users'),
  ('artist', 2.5, '150% bonus for verified artists'),
  ('moderator', 1.75, '75% bonus for moderators'),
  ('business', 1.5, '50% bonus for business accounts'),
  ('admin', 3.0, '200% bonus for admins');

-- Enable RLS on all tables
ALTER TABLE public.artist_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_multipliers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artist_applications
CREATE POLICY "Users can view their own applications" ON public.artist_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own application" ON public.artist_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending application" ON public.artist_applications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins and moderators can view all applications" ON public.artist_applications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can update any application" ON public.artist_applications
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for moderator_applications
CREATE POLICY "Users can view their own mod applications" ON public.moderator_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mod application" ON public.moderator_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending mod application" ON public.moderator_applications
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all mod applications" ON public.moderator_applications
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update any mod application" ON public.moderator_applications
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for tips
CREATE POLICY "Users can view tips they sent or received" ON public.tips
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_artist_id);

CREATE POLICY "Users can send tips" ON public.tips
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- RLS Policies for artist_earnings
CREATE POLICY "Artists can view their own earnings" ON public.artist_earnings
  FOR SELECT USING (auth.uid() = artist_id);

CREATE POLICY "System can insert earnings" ON public.artist_earnings
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- RLS Policies for reward_multipliers
CREATE POLICY "Anyone can view reward multipliers" ON public.reward_multipliers
  FOR SELECT USING (true);

-- Function to approve artist application
CREATE OR REPLACE FUNCTION public.approve_artist_application(p_application_id UUID, p_admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if admin
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RETURN FALSE;
  END IF;

  -- Get user_id from application
  SELECT user_id INTO v_user_id FROM artist_applications WHERE id = p_application_id AND status = 'pending';
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update application status
  UPDATE artist_applications 
  SET status = 'approved', reviewed_by = p_admin_id, reviewed_at = now() 
  WHERE id = p_application_id;

  -- Assign artist role
  INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'artist')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Update profile
  UPDATE profiles SET is_artist_pending = FALSE WHERE user_id = v_user_id;

  -- Award achievement
  INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, reward_amount)
  VALUES (v_user_id, 'artist_verified', 'Verified Artist', 'Congratulations on becoming a verified artist!', 500)
  ON CONFLICT DO NOTHING;

  -- Add reward to balance
  UPDATE profiles SET thdr_balance = COALESCE(thdr_balance, 0) + 500 WHERE user_id = v_user_id;

  RETURN TRUE;
END;
$$;

-- Function to approve moderator application
CREATE OR REPLACE FUNCTION public.approve_moderator_application(p_application_id UUID, p_admin_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if admin
  IF NOT public.has_role(p_admin_id, 'admin') THEN
    RETURN FALSE;
  END IF;

  -- Get user_id from application
  SELECT user_id INTO v_user_id FROM moderator_applications WHERE id = p_application_id AND status = 'pending';
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Update application status
  UPDATE moderator_applications 
  SET status = 'approved', reviewed_by = p_admin_id, reviewed_at = now() 
  WHERE id = p_application_id;

  -- Assign moderator role
  INSERT INTO user_roles (user_id, role) VALUES (v_user_id, 'moderator')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Update profile
  UPDATE profiles SET is_moderator_pending = FALSE WHERE user_id = v_user_id;

  -- Award achievement
  INSERT INTO user_achievements (user_id, achievement_type, achievement_name, description, reward_amount)
  VALUES (v_user_id, 'moderator_verified', 'Community Moderator', 'Welcome to the moderation team!', 300)
  ON CONFLICT DO NOTHING;

  -- Add reward to balance
  UPDATE profiles SET thdr_balance = COALESCE(thdr_balance, 0) + 300 WHERE user_id = v_user_id;

  RETURN TRUE;
END;
$$;

-- Function to send tip
CREATE OR REPLACE FUNCTION public.send_tip(p_from_user UUID, p_to_artist UUID, p_amount NUMERIC, p_token TEXT DEFAULT 'THDR', p_message TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance NUMERIC;
  v_fee NUMERIC;
  v_artist_amount NUMERIC;
BEGIN
  -- Check balance
  IF p_token = 'THDR' THEN
    SELECT thdr_balance INTO v_balance FROM profiles WHERE user_id = p_from_user;
  ELSE
    SELECT ion_balance INTO v_balance FROM profiles WHERE user_id = p_from_user;
  END IF;

  IF v_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Calculate fee (5% platform fee)
  v_fee := p_amount * 0.05;
  v_artist_amount := p_amount - v_fee;

  -- Deduct from sender
  IF p_token = 'THDR' THEN
    UPDATE profiles SET thdr_balance = thdr_balance - p_amount WHERE user_id = p_from_user;
    UPDATE profiles SET thdr_balance = COALESCE(thdr_balance, 0) + v_artist_amount WHERE user_id = p_to_artist;
  ELSE
    UPDATE profiles SET ion_balance = ion_balance - p_amount WHERE user_id = p_from_user;
    UPDATE profiles SET ion_balance = COALESCE(ion_balance, 0) + v_artist_amount WHERE user_id = p_to_artist;
  END IF;

  -- Record tip
  INSERT INTO tips (from_user_id, to_artist_id, amount, token_symbol, message)
  VALUES (p_from_user, p_to_artist, p_amount, p_token, p_message);

  -- Record artist earning
  INSERT INTO artist_earnings (artist_id, earning_type, amount, token_symbol)
  VALUES (p_to_artist, 'tip', v_artist_amount, p_token);

  -- Process platform fee (burn 50%, 50% to partnership pool)
  PERFORM public.process_platform_fee('tip', v_fee, p_token);

  RETURN TRUE;
END;
$$;