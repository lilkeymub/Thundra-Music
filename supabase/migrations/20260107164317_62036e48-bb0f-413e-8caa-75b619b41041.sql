
-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  username TEXT UNIQUE,
  email TEXT,
  phone TEXT,
  country TEXT,
  date_of_birth DATE,
  avatar_url TEXT,
  bio TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'vip', 'artist', 'moderator', 'staff', 'admin')),
  is_artist_pending BOOLEAN DEFAULT FALSE,
  is_moderator_pending BOOLEAN DEFAULT FALSE,
  thdr_balance DECIMAL(18, 8) DEFAULT 0,
  ice_balance DECIMAL(18, 8) DEFAULT 0,
  total_streams INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  web3_wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, referral_code)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    UPPER(SUBSTRING(MD5(NEW.id::text) FROM 1 FOR 8))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
