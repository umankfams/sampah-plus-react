-- Create enum for profile status
CREATE TYPE public.profile_status AS ENUM ('Aktif', 'Non-aktif');

-- Add status column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN status profile_status NOT NULL DEFAULT 'Aktif';

-- Add index for faster queries on status
CREATE INDEX idx_profiles_status ON public.profiles(status);