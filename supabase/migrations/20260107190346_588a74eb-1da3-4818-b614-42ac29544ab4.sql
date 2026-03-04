-- Chat Spaces tables
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private', 'direct')),
  cover_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view public rooms" ON public.chat_rooms FOR SELECT USING (type = 'public' OR created_by = auth.uid());
CREATE POLICY "Authenticated users can create rooms" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'system')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view messages in public rooms" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NFT Marketplace tables
CREATE TABLE public.nft_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  artist_id UUID NOT NULL,
  cover_url TEXT NOT NULL,
  audio_url TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'THDR',
  total_supply INTEGER DEFAULT 1,
  remaining_supply INTEGER DEFAULT 1,
  category TEXT DEFAULT 'music',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.nft_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active listings" ON public.nft_listings FOR SELECT USING (is_active = true);
CREATE POLICY "Artists can create listings" ON public.nft_listings FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update own listings" ON public.nft_listings FOR UPDATE USING (auth.uid() = artist_id);

CREATE TABLE public.nft_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES public.nft_listings(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'THDR',
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.nft_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own purchases" ON public.nft_purchases FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can make purchases" ON public.nft_purchases FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Ads tables
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  ad_type TEXT DEFAULT 'banner' CHECK (ad_type IN ('banner', 'video', 'audio', 'sponsored')),
  budget NUMERIC DEFAULT 0,
  spent NUMERIC DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active ads" ON public.ads FOR SELECT USING (is_active = true);
CREATE POLICY "Advertisers can create ads" ON public.ads FOR INSERT WITH CHECK (auth.uid() = advertiser_id);
CREATE POLICY "Advertisers can update own ads" ON public.ads FOR UPDATE USING (auth.uid() = advertiser_id);

-- AI Chat history
CREATE TABLE public.ai_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own conversations" ON public.ai_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create conversations" ON public.ai_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.ai_conversations FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.ai_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in own conversations" ON public.ai_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM ai_conversations WHERE id = conversation_id AND user_id = auth.uid()));
CREATE POLICY "Users can add messages to own conversations" ON public.ai_messages FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM ai_conversations WHERE id = conversation_id AND user_id = auth.uid()));

-- Storage bucket for avatars and media
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('nft-media', 'nft-media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-media', 'ad-media', true);

-- Storage policies
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view nft media" ON storage.objects FOR SELECT USING (bucket_id = 'nft-media');
CREATE POLICY "Users can upload nft media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'nft-media' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view ad media" ON storage.objects FOR SELECT USING (bucket_id = 'ad-media');
CREATE POLICY "Users can upload ad media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ad-media' AND auth.uid() IS NOT NULL);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;