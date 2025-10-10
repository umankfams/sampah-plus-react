-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policy for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Drop existing policies on transaksi table
DROP POLICY IF EXISTS "Authenticated users can view all transactions" ON public.transaksi;
DROP POLICY IF EXISTS "Authenticated users can insert transactions" ON public.transaksi;
DROP POLICY IF EXISTS "Authenticated users can update transactions" ON public.transaksi;
DROP POLICY IF EXISTS "Authenticated users can delete transactions" ON public.transaksi;

-- Create secure RLS policies for transaksi
CREATE POLICY "Users can view their own transactions"
ON public.transaksi
FOR SELECT
USING (auth.uid() = nasabah_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own transactions"
ON public.transaksi
FOR INSERT
WITH CHECK (auth.uid() = nasabah_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own transactions"
ON public.transaksi
FOR UPDATE
USING (auth.uid() = nasabah_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own transactions"
ON public.transaksi
FOR DELETE
USING (auth.uid() = nasabah_id OR public.has_role(auth.uid(), 'admin'));

-- Drop existing policies on transaksi_detail
DROP POLICY IF EXISTS "Authenticated users can view transaction details" ON public.transaksi_detail;
DROP POLICY IF EXISTS "Authenticated users can insert transaction details" ON public.transaksi_detail;
DROP POLICY IF EXISTS "Authenticated users can update transaction details" ON public.transaksi_detail;
DROP POLICY IF EXISTS "Authenticated users can delete transaction details" ON public.transaksi_detail;

-- Create secure RLS policies for transaksi_detail
CREATE POLICY "Users can view their own transaction details"
ON public.transaksi_detail
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.transaksi
    WHERE transaksi.id = transaksi_detail.transaksi_id
    AND (transaksi.nasabah_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Users can insert their own transaction details"
ON public.transaksi_detail
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.transaksi
    WHERE transaksi.id = transaksi_detail.transaksi_id
    AND (transaksi.nasabah_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Users can update their own transaction details"
ON public.transaksi_detail
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.transaksi
    WHERE transaksi.id = transaksi_detail.transaksi_id
    AND (transaksi.nasabah_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

CREATE POLICY "Users can delete their own transaction details"
ON public.transaksi_detail
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.transaksi
    WHERE transaksi.id = transaksi_detail.transaksi_id
    AND (transaksi.nasabah_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- Drop existing policies on cashout
DROP POLICY IF EXISTS "Authenticated users can view cashout" ON public.cashout;
DROP POLICY IF EXISTS "Authenticated users can insert cashout" ON public.cashout;
DROP POLICY IF EXISTS "Authenticated users can update cashout" ON public.cashout;
DROP POLICY IF EXISTS "Authenticated users can delete cashout" ON public.cashout;

-- Create secure RLS policies for cashout
CREATE POLICY "Users can view their own cashouts"
ON public.cashout
FOR SELECT
USING (auth.uid() = nasabah_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own cashouts"
ON public.cashout
FOR INSERT
WITH CHECK (auth.uid() = nasabah_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own cashouts"
ON public.cashout
FOR UPDATE
USING (auth.uid() = nasabah_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete their own cashouts"
ON public.cashout
FOR DELETE
USING (auth.uid() = nasabah_id OR public.has_role(auth.uid(), 'admin'));

-- Update profiles RLS to allow authenticated users to view all profiles (for dropdowns)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Allow admins full access to profiles
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage jenis_sampah
DROP POLICY IF EXISTS "Authenticated users can insert jenis sampah" ON public.jenis_sampah;
DROP POLICY IF EXISTS "Authenticated users can update jenis sampah" ON public.jenis_sampah;
DROP POLICY IF EXISTS "Authenticated users can delete jenis sampah" ON public.jenis_sampah;

CREATE POLICY "Only admins can insert jenis sampah"
ON public.jenis_sampah
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update jenis sampah"
ON public.jenis_sampah
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete jenis sampah"
ON public.jenis_sampah
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Assign admin role to umank@umank.com
-- This will be done after the user signs up with this email