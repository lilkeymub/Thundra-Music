-- Create ticket_purchases table if not exists (skip if exists)
CREATE TABLE IF NOT EXISTS public.ticket_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL,
  buyer_id UUID NOT NULL,
  quantity INTEGER DEFAULT 1,
  total_paid NUMERIC NOT NULL,
  qr_code TEXT,
  status TEXT DEFAULT 'active',
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ticket_delegations table
CREATE TABLE IF NOT EXISTS public.ticket_delegations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  artist_id UUID NOT NULL,
  delegate_id UUID NOT NULL,
  commission_percent NUMERIC NOT NULL DEFAULT 10,
  max_tickets INTEGER,
  sold_tickets INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create merchs table if not exists
CREATE TABLE IF NOT EXISTS public.merchs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'THDR',
  category TEXT,
  stock INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ticket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merchs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view own purchases" ON public.ticket_purchases;
DROP POLICY IF EXISTS "Users can purchase tickets" ON public.ticket_purchases;
DROP POLICY IF EXISTS "Delegations viewable by involved parties" ON public.ticket_delegations;
DROP POLICY IF EXISTS "Artists can create delegations" ON public.ticket_delegations;
DROP POLICY IF EXISTS "Artists can update delegations" ON public.ticket_delegations;
DROP POLICY IF EXISTS "Merchs are viewable by everyone" ON public.merchs;
DROP POLICY IF EXISTS "Sellers can create merchs" ON public.merchs;
DROP POLICY IF EXISTS "Sellers can update own merchs" ON public.merchs;
DROP POLICY IF EXISTS "Sellers can delete own merchs" ON public.merchs;

-- Create policies for ticket_purchases
CREATE POLICY "Users can view own purchases" ON public.ticket_purchases FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can purchase tickets" ON public.ticket_purchases FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Create policies for ticket_delegations
CREATE POLICY "Delegations viewable by involved parties" ON public.ticket_delegations FOR SELECT USING (
  auth.uid() = artist_id OR auth.uid() = delegate_id
);
CREATE POLICY "Artists can create delegations" ON public.ticket_delegations FOR INSERT WITH CHECK (auth.uid() = artist_id);
CREATE POLICY "Artists can update delegations" ON public.ticket_delegations FOR UPDATE USING (auth.uid() = artist_id);

-- Create policies for merchs
CREATE POLICY "Merchs are viewable by everyone" ON public.merchs FOR SELECT USING (true);
CREATE POLICY "Sellers can create merchs" ON public.merchs FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update own merchs" ON public.merchs FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can delete own merchs" ON public.merchs FOR DELETE USING (auth.uid() = seller_id);