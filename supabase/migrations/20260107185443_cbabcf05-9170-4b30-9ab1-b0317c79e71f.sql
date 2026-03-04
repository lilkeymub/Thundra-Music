-- Fix function search path for generate_username
CREATE OR REPLACE FUNCTION public.generate_username(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  base_username := lower(regexp_replace(split_part(p_email, '@', 1), '[^a-z0-9]', '', 'g'));
  
  IF length(base_username) < 3 THEN
    base_username := base_username || 'user';
  END IF;
  
  final_username := base_username;
  
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

-- Fix overly permissive RLS policy for daily_plays INSERT
DROP POLICY IF EXISTS "Anyone can insert plays" ON public.daily_plays;
CREATE POLICY "Anyone can insert plays" ON public.daily_plays 
FOR INSERT WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
  (auth.uid() IS NULL AND session_id IS NOT NULL AND user_id IS NULL)
);