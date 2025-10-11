-- Update profiles RLS policies to prevent users from changing no_induk
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile (except no_induk)"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  (no_induk = (SELECT no_induk FROM public.profiles WHERE id = auth.uid()))
);

-- Update transaksi policies - only admins can manage transactions
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transaksi;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transaksi;
DROP POLICY IF EXISTS "Users can delete their own transactions" ON public.transaksi;

CREATE POLICY "Only admins can insert transactions"
ON public.transaksi
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update transactions"
ON public.transaksi
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete transactions"
ON public.transaksi
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Update transaksi_detail policies - only admins can manage
DROP POLICY IF EXISTS "Users can insert their own transaction details" ON public.transaksi_detail;
DROP POLICY IF EXISTS "Users can update their own transaction details" ON public.transaksi_detail;
DROP POLICY IF EXISTS "Users can delete their own transaction details" ON public.transaksi_detail;

CREATE POLICY "Only admins can insert transaction details"
ON public.transaksi_detail
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update transaction details"
ON public.transaksi_detail
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete transaction details"
ON public.transaksi_detail
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Update profiles policies - only admins can delete profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'));