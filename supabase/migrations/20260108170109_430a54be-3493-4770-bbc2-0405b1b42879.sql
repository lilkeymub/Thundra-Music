-- Insert admin role for the existing user (lilmub)
INSERT INTO public.user_roles (user_id, role) 
VALUES ('2e8feac1-11d8-418a-9791-df65fc93fe7e', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create a function to allow admins to add other admin roles
CREATE OR REPLACE FUNCTION public.grant_admin_role(p_user_email text, p_admin_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_is_admin boolean;
BEGIN
  -- Check if caller is admin
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = p_admin_id AND role = 'admin'
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RETURN false;
  END IF;
  
  -- Get user_id from email
  SELECT p.user_id INTO v_user_id 
  FROM public.profiles p 
  WHERE p.email = p_user_email;
  
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Grant admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;