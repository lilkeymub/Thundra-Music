-- Create transactions_ledger table for explorer
CREATE TABLE IF NOT EXISTS public.transactions_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_hash TEXT NOT NULL UNIQUE DEFAULT ('TXN_' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 40))),
  transaction_type TEXT NOT NULL, -- subscription, tip, send, convert, purchase, burn, reward
  from_wallet_address TEXT,
  from_user_id UUID,
  from_email TEXT,
  to_wallet_address TEXT,
  to_user_id UUID,
  to_email TEXT,
  amount NUMERIC NOT NULL,
  token_symbol TEXT NOT NULL DEFAULT 'THDR',
  fee_amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'completed', -- pending, completed, failed
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transactions_ledger ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.transactions_ledger
  FOR SELECT
  USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- Allow all authenticated users to view burn records and public stats
CREATE POLICY "Anyone can view burn transactions"
  ON public.transactions_ledger
  FOR SELECT
  USING (transaction_type = 'burn');

-- Allow service to insert transactions
CREATE POLICY "Service can insert transactions"
  ON public.transactions_ledger
  FOR INSERT
  WITH CHECK (true);

-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions_ledger;

-- Create function to record transaction and send notification
CREATE OR REPLACE FUNCTION public.record_transaction(
  p_type TEXT,
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_amount NUMERIC,
  p_token TEXT DEFAULT 'THDR',
  p_fee NUMERIC DEFAULT 0,
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_transaction_id UUID;
  v_from_wallet TEXT;
  v_to_wallet TEXT;
  v_from_email TEXT;
  v_to_email TEXT;
BEGIN
  -- Get wallet addresses and emails
  SELECT web3_wallet_address, email INTO v_from_wallet, v_from_email
  FROM profiles WHERE user_id = p_from_user_id;
  
  SELECT web3_wallet_address, email INTO v_to_wallet, v_to_email
  FROM profiles WHERE user_id = p_to_user_id;
  
  -- Insert transaction
  INSERT INTO transactions_ledger (
    transaction_type, from_user_id, from_wallet_address, from_email,
    to_user_id, to_wallet_address, to_email, amount, token_symbol, 
    fee_amount, description
  ) VALUES (
    p_type, p_from_user_id, v_from_wallet, v_from_email,
    p_to_user_id, v_to_wallet, v_to_email, p_amount, p_token,
    p_fee, p_description
  ) RETURNING id INTO v_transaction_id;
  
  -- Create notification for sender
  IF p_from_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      p_from_user_id, 
      'transaction',
      'Transaction Completed',
      format('You sent %s %s', p_amount, p_token),
      jsonb_build_object('transaction_id', v_transaction_id, 'type', p_type)
    );
  END IF;
  
  -- Create notification for receiver
  IF p_to_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      p_to_user_id,
      'transaction', 
      'Payment Received',
      format('You received %s %s', p_amount, p_token),
      jsonb_build_object('transaction_id', v_transaction_id, 'type', p_type)
    );
  END IF;
  
  RETURN v_transaction_id;
END;
$$;