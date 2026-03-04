
-- Create user roles enum and table for role-based access
CREATE TYPE public.app_role AS ENUM ('free', 'premium', 'vip', 'artist', 'moderator', 'business', 'admin');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'free',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage roles" ON public.user_roles FOR ALL USING (true);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
    AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- Token supply table (1B $THDR distribution)
CREATE TABLE public.token_supply (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_symbol TEXT NOT NULL,
    pool_name TEXT NOT NULL,
    initial_supply NUMERIC NOT NULL,
    current_supply NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(token_symbol, pool_name)
);

INSERT INTO public.token_supply (token_symbol, pool_name, initial_supply, current_supply) VALUES
('THDR', 'mining_activities', 100000000, 100000000),
('THDR', 'ecosystem_rewards', 700000000, 700000000),
('THDR', 'team_advisors', 50000000, 50000000),
('THDR', 'partnership_growth', 150000000, 150000000),
('USDT', 'total_supply', 100000000, 100000000),
('ION', 'total_supply', 120000000, 120000000);

-- Liquidity pools for conversion
CREATE TABLE public.liquidity_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_name TEXT NOT NULL UNIQUE,
    token_a TEXT NOT NULL,
    token_b TEXT NOT NULL,
    reserve_a NUMERIC NOT NULL,
    reserve_b NUMERIC NOT NULL,
    fee_rate NUMERIC DEFAULT 0.003,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO public.liquidity_pools (pool_name, token_a, token_b, reserve_a, reserve_b) VALUES
('THDR_USDT', 'THDR', 'USDT', 80000000, 60000000),
('THDR_ION', 'THDR', 'ION', 50000000, 70000000),
('USDT_ION', 'USDT', 'ION', 30000000, 50000000);

-- Token prices table (real-time tracking)
CREATE TABLE public.token_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_symbol TEXT NOT NULL UNIQUE,
    price_usd NUMERIC NOT NULL,
    price_change_24h NUMERIC DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO public.token_prices (token_symbol, price_usd) VALUES
('THDR', 0.5),
('ION', 0.5),
('USDT', 1.0);

-- Burn records
CREATE TABLE public.burn_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_symbol TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    burn_type TEXT NOT NULL,
    source_activity TEXT,
    burned_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Active users tracking (real-time)
CREATE TABLE public.active_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_token TEXT,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Reward activities
CREATE TABLE public.reward_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    base_reward NUMERIC NOT NULL,
    multiplier NUMERIC DEFAULT 1,
    final_reward NUMERIC NOT NULL,
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('premium', 'vip')),
    months_purchased INTEGER NOT NULL,
    price_paid NUMERIC NOT NULL,
    token_used TEXT NOT NULL,
    discount_applied NUMERIC DEFAULT 0,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User wallets with generated addresses
CREATE TABLE public.user_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    wallet_address TEXT NOT NULL UNIQUE,
    thdr_balance NUMERIC DEFAULT 0,
    usdt_balance NUMERIC DEFAULT 0,
    ion_balance NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Wallet transactions
CREATE TABLE public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID,
    to_user_id UUID,
    transaction_type TEXT NOT NULL,
    token_symbol TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    fee NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'completed',
    reference_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Learning section tables
CREATE TABLE public.learning_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    category TEXT,
    difficulty TEXT DEFAULT 'beginner',
    duration_minutes INTEGER,
    reward_thdr NUMERIC DEFAULT 10,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.learning_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.learning_courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID REFERENCES public.learning_courses(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    progress_percent INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, lesson_id)
);

-- Moderator actions
CREATE TABLE public.moderation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moderator_id UUID NOT NULL,
    target_user_id UUID,
    target_content_id UUID,
    action_type TEXT NOT NULL,
    reason TEXT,
    votes_required INTEGER DEFAULT 3,
    votes_received INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE public.moderation_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_id UUID REFERENCES public.moderation_actions(id) ON DELETE CASCADE NOT NULL,
    moderator_id UUID NOT NULL,
    vote TEXT NOT NULL CHECK (vote IN ('approve', 'reject')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(action_id, moderator_id)
);

-- Business profiles
CREATE TABLE public.business_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    business_name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    industry TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Referral tracking
CREATE TABLE public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL,
    referred_id UUID NOT NULL,
    reward_earned NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(referred_id)
);

-- User follows
CREATE TABLE public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL,
    following_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(follower_id, following_id)
);

-- Posts table for social features
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    content TEXT,
    media_urls TEXT[],
    post_type TEXT DEFAULT 'text',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    reaction_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(post_id, user_id)
);

CREATE TABLE public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Marketplace merchs
CREATE TABLE public.merchs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    currency TEXT DEFAULT 'THDR',
    cover_url TEXT,
    category TEXT,
    stock INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.merch_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merch_id UUID REFERENCES public.merchs(id) ON DELETE SET NULL,
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    price NUMERIC NOT NULL,
    platform_fee NUMERIC NOT NULL,
    burned_amount NUMERIC NOT NULL,
    partnership_pool_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Audio spaces
CREATE TABLE public.audio_spaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    is_live BOOLEAN DEFAULT false,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.audio_space_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    space_id UUID REFERENCES public.audio_spaces(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    role TEXT DEFAULT 'listener',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(space_id, user_id)
);

-- Events
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    event_type TEXT,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    location TEXT,
    is_virtual BOOLEAN DEFAULT true,
    max_attendees INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Polls
CREATE TABLE public.polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL,
    option_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(poll_id, user_id)
);

-- Auctions
CREATE TABLE public.auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL,
    item_type TEXT NOT NULL,
    item_id UUID NOT NULL,
    starting_price NUMERIC NOT NULL,
    current_bid NUMERIC,
    current_bidder_id UUID,
    reserve_price NUMERIC,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.auction_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
    bidder_id UUID NOT NULL,
    bid_amount NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User preferences for language and personalization
CREATE TABLE public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    language TEXT DEFAULT 'en',
    theme TEXT DEFAULT 'dark',
    music_preferences JSONB,
    notification_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Moderator ranks
CREATE TABLE public.moderator_ranks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    rank_level INTEGER DEFAULT 1,
    actions_completed INTEGER DEFAULT 0,
    accuracy_score NUMERIC DEFAULT 100,
    bonus_rate NUMERIC DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Artist ranks
CREATE TABLE public.artist_ranks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    rank_level INTEGER DEFAULT 1,
    total_streams INTEGER DEFAULT 0,
    total_earnings NUMERIC DEFAULT 0,
    bonus_rate NUMERIC DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fee collection records
CREATE TABLE public.fee_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type TEXT NOT NULL,
    original_amount NUMERIC NOT NULL,
    fee_amount NUMERIC NOT NULL,
    token_symbol TEXT NOT NULL,
    burned_amount NUMERIC DEFAULT 0,
    partnership_pool_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update profiles table with ION instead of ICE and wallet address
ALTER TABLE public.profiles RENAME COLUMN ice_balance TO ion_balance;

-- Enable RLS on all new tables
ALTER TABLE public.token_supply ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidity_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.burn_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_space_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderator_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view token supply" ON public.token_supply FOR SELECT USING (true);
CREATE POLICY "Anyone can view liquidity pools" ON public.liquidity_pools FOR SELECT USING (true);
CREATE POLICY "Anyone can view token prices" ON public.token_prices FOR SELECT USING (true);
CREATE POLICY "Anyone can view burn records" ON public.burn_records FOR SELECT USING (true);

CREATE POLICY "Users can manage own sessions" ON public.active_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own rewards" ON public.reward_activities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert rewards" ON public.reward_activities FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own wallet" ON public.user_wallets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can create transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Anyone can view published courses" ON public.learning_courses FOR SELECT USING (is_published = true);
CREATE POLICY "Instructors can manage courses" ON public.learning_courses FOR ALL USING (auth.uid() = instructor_id);
CREATE POLICY "Anyone can view lessons" ON public.learning_lessons FOR SELECT USING (true);
CREATE POLICY "Users can manage own progress" ON public.learning_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view moderation actions" ON public.moderation_actions FOR SELECT USING (true);
CREATE POLICY "Moderators can create actions" ON public.moderation_actions FOR INSERT WITH CHECK (true);
CREATE POLICY "Moderators can vote" ON public.moderation_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view votes" ON public.moderation_votes FOR SELECT USING (true);

CREATE POLICY "Anyone can view verified businesses" ON public.business_profiles FOR SELECT USING (is_verified = true);
CREATE POLICY "Users can manage own business" ON public.business_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own referrals" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "System can create referrals" ON public.referrals FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

CREATE POLICY "Anyone can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view post reactions" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage own reactions" ON public.post_reactions FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view post comments" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active merchs" ON public.merchs FOR SELECT USING (is_active = true);
CREATE POLICY "Sellers can manage merchs" ON public.merchs FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Users can view own purchases" ON public.merch_purchases FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can create purchases" ON public.merch_purchases FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Anyone can view audio spaces" ON public.audio_spaces FOR SELECT USING (true);
CREATE POLICY "Hosts can manage spaces" ON public.audio_spaces FOR ALL USING (auth.uid() = host_id);

CREATE POLICY "Anyone can view participants" ON public.audio_space_participants FOR SELECT USING (true);
CREATE POLICY "Users can join spaces" ON public.audio_space_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Organizers can manage events" ON public.events FOR ALL USING (auth.uid() = organizer_id);

CREATE POLICY "Anyone can view polls" ON public.polls FOR SELECT USING (true);
CREATE POLICY "Users can create polls" ON public.polls FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Anyone can view poll votes" ON public.poll_votes FOR SELECT USING (true);
CREATE POLICY "Users can vote" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view auctions" ON public.auctions FOR SELECT USING (true);
CREATE POLICY "Sellers can manage auctions" ON public.auctions FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Anyone can view bids" ON public.auction_bids FOR SELECT USING (true);
CREATE POLICY "Users can place bids" ON public.auction_bids FOR INSERT WITH CHECK (auth.uid() = bidder_id);

CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view moderator ranks" ON public.moderator_ranks FOR SELECT USING (true);
CREATE POLICY "Anyone can view artist ranks" ON public.artist_ranks FOR SELECT USING (true);

CREATE POLICY "Anyone can view fee collections" ON public.fee_collections FOR SELECT USING (true);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.active_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.token_prices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.burn_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.audio_spaces;

-- Function to generate unique wallet address
CREATE OR REPLACE FUNCTION public.generate_wallet_address()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_address TEXT;
BEGIN
  new_address := 'THDR' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 32));
  RETURN new_address;
END;
$$;

-- Function to create wallet on user signup
CREATE OR REPLACE FUNCTION public.create_user_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_wallets (user_id, wallet_address, thdr_balance)
  VALUES (NEW.id, public.generate_wallet_address(), 100);
  
  -- Deduct from ecosystem rewards pool
  UPDATE public.token_supply 
  SET current_supply = current_supply - 100 
  WHERE token_symbol = 'THDR' AND pool_name = 'ecosystem_rewards';
  
  -- Create default role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'free');
  
  RETURN NEW;
END;
$$;

-- Trigger for wallet creation
CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_wallet();

-- Function to calculate reward with multiplier
CREATE OR REPLACE FUNCTION public.calculate_reward(p_user_id UUID, p_base_reward NUMERIC, p_activity_type TEXT)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  multiplier NUMERIC := 1;
  final_reward NUMERIC;
BEGIN
  -- Check user tier
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = 'vip' AND (expires_at IS NULL OR expires_at > now())) THEN
    multiplier := 3;
  ELSIF EXISTS (SELECT 1 FROM user_roles WHERE user_id = p_user_id AND role = 'premium' AND (expires_at IS NULL OR expires_at > now())) THEN
    multiplier := 2;
  END IF;
  
  final_reward := p_base_reward * multiplier;
  
  -- Record reward activity
  INSERT INTO reward_activities (user_id, activity_type, base_reward, multiplier, final_reward)
  VALUES (p_user_id, p_activity_type, p_base_reward, multiplier, final_reward);
  
  -- Update user wallet
  UPDATE user_wallets SET thdr_balance = thdr_balance + final_reward WHERE user_id = p_user_id;
  
  -- Deduct from ecosystem rewards pool
  UPDATE token_supply SET current_supply = current_supply - final_reward 
  WHERE token_symbol = 'THDR' AND pool_name = 'ecosystem_rewards';
  
  RETURN final_reward;
END;
$$;

-- Function to burn tokens
CREATE OR REPLACE FUNCTION public.burn_tokens(p_amount NUMERIC, p_token TEXT, p_burn_type TEXT, p_source TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO burn_records (token_symbol, amount, burn_type, source_activity)
  VALUES (p_token, p_amount, p_burn_type, p_source);
END;
$$;

-- Function to process platform fees
CREATE OR REPLACE FUNCTION public.process_platform_fee(p_amount NUMERIC, p_activity_type TEXT, p_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  fee_amount NUMERIC;
  burn_amount NUMERIC;
  partnership_amount NUMERIC;
BEGIN
  IF p_activity_type = 'marketplace' OR p_activity_type = 'ads' THEN
    fee_amount := p_amount * 0.10;
    burn_amount := fee_amount * 0.50;
    partnership_amount := fee_amount * 0.50;
    
    -- Add to partnership pool
    UPDATE token_supply SET current_supply = current_supply + partnership_amount 
    WHERE token_symbol = 'THDR' AND pool_name = 'partnership_growth';
  ELSE
    fee_amount := p_amount * 0.10;
    burn_amount := fee_amount;
    partnership_amount := 0;
  END IF;
  
  -- Record fee
  INSERT INTO fee_collections (activity_type, original_amount, fee_amount, token_symbol, burned_amount, partnership_pool_amount)
  VALUES (p_activity_type, p_amount, fee_amount, p_token, burn_amount, partnership_amount);
  
  -- Burn tokens
  PERFORM burn_tokens(burn_amount, p_token, 'fee_burn', p_activity_type);
END;
$$;
