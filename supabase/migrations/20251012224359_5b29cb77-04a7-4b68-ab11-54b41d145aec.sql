-- Create enum for cashout status
CREATE TYPE public.cashout_status AS ENUM ('pending', 'approved', 'rejected');

-- Add status column to cashout table
ALTER TABLE public.cashout 
ADD COLUMN status cashout_status NOT NULL DEFAULT 'pending';

-- Add index for faster queries on status
CREATE INDEX idx_cashout_status ON public.cashout(status);