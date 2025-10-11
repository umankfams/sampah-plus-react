-- Drop the old policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new policy that restricts users to viewing only their own profile, or all if admin
CREATE POLICY "Users can view their own profile or admins can view all"
ON public.profiles
FOR SELECT
USING ((auth.uid() = id) OR has_role(auth.uid(), 'admin'::app_role));