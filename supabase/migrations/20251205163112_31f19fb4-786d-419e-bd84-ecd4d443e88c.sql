-- 1. Add CHECK constraint to prevent negative balances
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_saldo_non_negative CHECK (saldo >= 0);

-- 2. Create admin_phones table for secure admin assignment
CREATE TABLE IF NOT EXISTS public.admin_phones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_phones
ALTER TABLE public.admin_phones ENABLE ROW LEVEL SECURITY;

-- Only admins can view/modify admin_phones
CREATE POLICY "Only admins can view admin phones"
ON public.admin_phones FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert admin phones"
ON public.admin_phones FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete admin phones"
ON public.admin_phones FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Insert the initial admin phone (this will be protected by RLS after first admin is created)
INSERT INTO public.admin_phones (phone) VALUES ('+6281255691234')
ON CONFLICT (phone) DO NOTHING;

-- 3. Create trigger function to auto-assign admin role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_phone text;
  is_admin_phone boolean;
BEGIN
  -- Get the user's phone from auth.users
  SELECT phone INTO user_phone FROM auth.users WHERE id = NEW.id;
  
  -- Check if this phone is in admin_phones table
  SELECT EXISTS (
    SELECT 1 FROM public.admin_phones WHERE phone = user_phone
  ) INTO is_admin_phone;
  
  -- Assign role based on admin phone lookup
  IF is_admin_phone THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table (fires after profile is created during signup)
DROP TRIGGER IF EXISTS on_profile_created_assign_role ON public.profiles;
CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- 4. Fix cashout trigger to only deduct balance on approval
CREATE OR REPLACE FUNCTION public.update_saldo_after_cashout()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance numeric;
BEGIN
  -- Only handle status changes for balance updates
  IF TG_OP = 'UPDATE' THEN
    -- When status changes TO approved, deduct balance
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
      -- Verify sufficient balance before deducting
      SELECT saldo INTO current_balance FROM public.profiles WHERE id = NEW.nasabah_id;
      IF current_balance < NEW.jumlah THEN
        RAISE EXCEPTION 'Insufficient balance for cashout approval';
      END IF;
      
      UPDATE public.profiles
      SET saldo = saldo - NEW.jumlah
      WHERE id = NEW.nasabah_id;
    END IF;
    
    -- When status changes FROM approved to something else, refund balance
    IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
      UPDATE public.profiles
      SET saldo = saldo + OLD.jumlah
      WHERE id = NEW.nasabah_id;
    END IF;
  END IF;
  
  -- Handle deletes - only refund if was approved
  IF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
    UPDATE public.profiles
    SET saldo = saldo + OLD.jumlah
    WHERE id = OLD.nasabah_id;
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS update_saldo_after_cashout ON public.cashout;
CREATE TRIGGER update_saldo_after_cashout
  AFTER UPDATE OR DELETE ON public.cashout
  FOR EACH ROW
  EXECUTE FUNCTION public.update_saldo_after_cashout();

-- 5. Add explicit policies to user_roles table for defense-in-depth
CREATE POLICY "Block direct role inserts"
ON public.user_roles FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block direct role updates"
ON public.user_roles FOR UPDATE
USING (false);

CREATE POLICY "Block direct role deletes"
ON public.user_roles FOR DELETE
USING (false);