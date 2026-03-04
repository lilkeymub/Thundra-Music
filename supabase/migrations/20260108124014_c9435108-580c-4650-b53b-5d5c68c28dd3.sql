-- Create notifications table for push notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Create support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create tickets"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tickets"
ON public.support_tickets FOR SELECT
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin')
));

CREATE POLICY "Moderators can update tickets"
ON public.support_tickets FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin')
));

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL,
  reported_user_id UUID,
  content_type TEXT NOT NULL,
  content_id UUID,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Moderators can view reports"
ON public.reports FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin')
) OR auth.uid() = reporter_id);

CREATE POLICY "Moderators can update reports"
ON public.reports FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('moderator', 'admin')
));

-- Create albums table for artist album uploads
CREATE TABLE public.albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  release_date DATE,
  genre TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published albums"
ON public.albums FOR SELECT
USING (is_published = true OR auth.uid() = artist_id);

CREATE POLICY "Artists can manage albums"
ON public.albums FOR ALL
USING (auth.uid() = artist_id);

-- Add album_id to tracks
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS album_id UUID REFERENCES public.albums(id);
ALTER TABLE public.tracks ADD COLUMN IF NOT EXISTS artist_id UUID;

-- Create events table for concerts/shows with ticket support
CREATE TABLE public.event_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id),
  ticket_type TEXT NOT NULL DEFAULT 'general',
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'THDR',
  total_quantity INTEGER NOT NULL DEFAULT 100,
  sold_quantity INTEGER NOT NULL DEFAULT 0,
  benefits TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tickets"
ON public.event_tickets FOR SELECT
USING (true);

CREATE POLICY "Organizers can manage tickets"
ON public.event_tickets FOR ALL
USING (EXISTS (
  SELECT 1 FROM events WHERE events.id = event_tickets.event_id AND events.organizer_id = auth.uid()
));

-- Create ticket purchases table
CREATE TABLE public.ticket_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.event_tickets(id),
  buyer_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC NOT NULL,
  qr_code TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
ON public.ticket_purchases FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Users can purchase tickets"
ON public.ticket_purchases FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

-- Create giveaways table
CREATE TABLE public.giveaways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  prize_type TEXT NOT NULL,
  prize_value NUMERIC,
  prize_description TEXT,
  entry_requirements JSONB DEFAULT '{}',
  max_entries INTEGER,
  current_entries INTEGER DEFAULT 0,
  winner_id UUID,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.giveaways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active giveaways"
ON public.giveaways FOR SELECT
USING (status = 'active' OR auth.uid() = creator_id);

CREATE POLICY "Creators can manage giveaways"
ON public.giveaways FOR ALL
USING (auth.uid() = creator_id);

-- Create giveaway entries table
CREATE TABLE public.giveaway_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  giveaway_id UUID NOT NULL REFERENCES public.giveaways(id),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(giveaway_id, user_id)
);

ALTER TABLE public.giveaway_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can enter giveaways"
ON public.giveaway_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own entries"
ON public.giveaway_entries FOR SELECT
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM giveaways WHERE giveaways.id = giveaway_entries.giveaway_id AND giveaways.creator_id = auth.uid()
));

-- Create Feed posts with reactions and comments
CREATE TABLE public.feed_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT,
  media_urls TEXT[],
  post_type TEXT DEFAULT 'text',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view posts"
ON public.feed_posts FOR SELECT
USING (true);

CREATE POLICY "Users can create posts"
ON public.feed_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own posts"
ON public.feed_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
ON public.feed_posts FOR DELETE
USING (auth.uid() = user_id);

-- Create direct messages table
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
ON public.direct_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON public.direct_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Create channels table
CREATE TABLE public.channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  type TEXT NOT NULL DEFAULT 'public',
  join_type TEXT NOT NULL DEFAULT 'open',
  member_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public channels"
ON public.channels FOR SELECT
USING (type = 'public' OR auth.uid() = owner_id);

CREATE POLICY "Owners can manage channels"
ON public.channels FOR ALL
USING (auth.uid() = owner_id);

-- Create channel members table
CREATE TABLE public.channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.channels(id),
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view channel members"
ON public.channel_members FOR SELECT
USING (EXISTS (
  SELECT 1 FROM channel_members cm WHERE cm.channel_id = channel_members.channel_id AND cm.user_id = auth.uid()
) OR EXISTS (
  SELECT 1 FROM channels WHERE channels.id = channel_members.channel_id AND channels.type = 'public'
));

CREATE POLICY "Users can join channels"
ON public.channel_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave channels"
ON public.channel_members FOR DELETE
USING (auth.uid() = user_id);

-- Add learning_courses payable and certification fields
ALTER TABLE public.learning_courses ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT true;
ALTER TABLE public.learning_courses ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.learning_courses ADD COLUMN IF NOT EXISTS has_certification BOOLEAN DEFAULT false;
ALTER TABLE public.learning_courses ADD COLUMN IF NOT EXISTS total_hours INTEGER DEFAULT 0;
ALTER TABLE public.learning_courses ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.learning_courses ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.learning_courses ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Create user notification preferences
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  new_follower BOOLEAN DEFAULT true,
  new_comment BOOLEAN DEFAULT true,
  earnings_updates BOOLEAN DEFAULT true,
  promotions BOOLEAN DEFAULT false,
  dm_received BOOLEAN DEFAULT true,
  post_liked BOOLEAN DEFAULT true,
  new_release BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
ON public.notification_preferences FOR ALL
USING (auth.uid() = user_id);

-- Add realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;