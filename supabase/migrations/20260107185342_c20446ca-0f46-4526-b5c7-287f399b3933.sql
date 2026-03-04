-- Create tracks table for storing music
CREATE TABLE public.tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  cover_url TEXT,
  audio_url TEXT,
  duration TEXT,
  genre TEXT,
  plays_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  lyrics TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Everyone can view tracks
CREATE POLICY "Anyone can view tracks" ON public.tracks FOR SELECT USING (true);

-- Create track comments table
CREATE TABLE public.track_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.track_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.track_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON public.track_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.track_comments FOR DELETE USING (auth.uid() = user_id);

-- Create track reactions table
CREATE TABLE public.track_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID REFERENCES public.tracks(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('❤️', '🔥', '💎', '🎵', '👏', '😍')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(track_id, user_id, reaction_type)
);

ALTER TABLE public.track_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.track_reactions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can react" ON public.track_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own reactions" ON public.track_reactions FOR DELETE USING (auth.uid() = user_id);

-- Create daily plays tracking table
CREATE TABLE public.daily_plays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  play_date DATE NOT NULL DEFAULT CURRENT_DATE,
  plays_count INTEGER DEFAULT 0,
  UNIQUE(user_id, play_date),
  UNIQUE(session_id, play_date)
);

ALTER TABLE public.daily_plays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view their own plays" ON public.daily_plays FOR SELECT USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND session_id IS NOT NULL)
);
CREATE POLICY "Anyone can insert plays" ON public.daily_plays FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update their own plays" ON public.daily_plays FOR UPDATE USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND session_id IS NOT NULL)
);

-- Create login bonuses table
CREATE TABLE public.login_bonuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bonus_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount INTEGER NOT NULL DEFAULT 100,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, bonus_date)
);

ALTER TABLE public.login_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bonuses" ON public.login_bonuses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can claim bonuses" ON public.login_bonuses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to claim daily login bonus and update THDR balance
CREATE OR REPLACE FUNCTION public.claim_login_bonus(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  already_claimed BOOLEAN;
BEGIN
  -- Check if already claimed today
  SELECT EXISTS (
    SELECT 1 FROM login_bonuses 
    WHERE user_id = p_user_id AND bonus_date = CURRENT_DATE
  ) INTO already_claimed;
  
  IF already_claimed THEN
    RETURN FALSE;
  END IF;
  
  -- Record the bonus
  INSERT INTO login_bonuses (user_id, bonus_date, amount)
  VALUES (p_user_id, CURRENT_DATE, 100);
  
  -- Update THDR balance
  UPDATE profiles 
  SET thdr_balance = COALESCE(thdr_balance, 0) + 100
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Function to generate a unique username from email
CREATE OR REPLACE FUNCTION public.generate_username(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- Extract part before @ and clean it
  base_username := lower(regexp_replace(split_part(p_email, '@', 1), '[^a-z0-9]', '', 'g'));
  
  -- Ensure minimum length
  IF length(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;
  
  -- Try the base username first
  final_username := base_username;
  
  -- If taken, add random numbers
  WHILE EXISTS (SELECT 1 FROM profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := base_username || floor(random() * 9000 + 1000)::text;
    IF counter > 100 THEN
      final_username := base_username || gen_random_uuid()::text;
      EXIT;
    END IF;
  END LOOP;
  
  RETURN final_username;
END;
$$;

-- Update the handle_new_user function to auto-generate username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  generated_username TEXT;
BEGIN
  -- Generate username from email
  generated_username := public.generate_username(NEW.email);
  
  INSERT INTO public.profiles (
    user_id,
    email,
    full_name,
    username,
    thdr_balance
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    generated_username,
    100  -- Start with 100 THDR
  );
  
  RETURN NEW;
END;
$$;

-- Insert sample tracks
INSERT INTO public.tracks (id, title, artist, cover_url, duration, genre, plays_count, lyrics) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Electric Dreams', 'Neon Pulse', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300', '3:45', 'Electronic', 1200000, 'Electric dreams running through my mind\nNeon lights in the night so bright\nDancing to the rhythm of time\nFeeling alive in the electric light'),
  ('22222222-2222-2222-2222-222222222222', 'Midnight Groove', 'Luna Wave', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300', '4:12', 'R&B', 890000, 'Midnight groove got me feeling right\nStars above shining so bright\nMoving slow to the beat tonight\nEverything feels just right'),
  ('33333333-3333-3333-3333-333333333333', 'Savanna Sunset', 'African Beats', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300', '5:03', 'Afrobeats', 2100000, 'Savanna sunset painting the sky\nDrums beating as the day goes by\nAfrican rhythms make us fly\nUnder the golden sky we rise high'),
  ('44444444-4444-4444-4444-444444444444', 'City Lights', 'Metro Sound', 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300', '3:28', 'Hip Hop', 756000, NULL),
  ('55555555-5555-5555-5555-555555555555', 'Ocean Waves', 'Calm Waters', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300', '6:15', 'Amapiano', 1500000, 'Ocean waves crashing on the shore\nPeaceful sounds forevermore\nLet the rhythm take control\nHeal your mind, free your soul'),
  ('66666666-6666-6666-6666-666666666666', 'Dance Floor', 'DJ Thunder', 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=300', '4:45', 'Electronic', 3200000, NULL),
  ('77777777-7777-7777-7777-777777777777', 'Lagos Vibes', 'Afro King', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300', '3:55', 'Afrobeats', 4100000, 'Lagos vibes we dey celebrate\nAfrobeats make we feel great\nFrom the streets to the world stage\nWe dey set the trend, we dey reign'),
  ('88888888-8888-8888-8888-888888888888', 'Soul Journey', 'Mystic Soul', 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300', '5:20', 'R&B', 620000, 'Soul journey through the night\nSearching for the inner light\nEvery step we take is right\nOn this journey burning bright');

-- Enable realtime for comments and reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.track_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.track_reactions;