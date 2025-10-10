-- Create enum for units
CREATE TYPE public.satuan_type AS ENUM ('KG', 'Liter', 'Ml', 'Pcs');

-- Add satuan column to jenis_sampah
ALTER TABLE public.jenis_sampah ADD COLUMN satuan satuan_type NOT NULL DEFAULT 'KG';

-- Add saldo column to profiles
ALTER TABLE public.profiles ADD COLUMN saldo numeric NOT NULL DEFAULT 0;

-- Create cashout table
CREATE TABLE public.cashout (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nasabah_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tanggal_cashout DATE NOT NULL DEFAULT CURRENT_DATE,
  jumlah numeric NOT NULL,
  keterangan TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cashout table
ALTER TABLE public.cashout ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cashout
CREATE POLICY "Authenticated users can view cashout" 
ON public.cashout 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert cashout" 
ON public.cashout 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update cashout" 
ON public.cashout 
FOR UPDATE 
USING (true);

CREATE POLICY "Authenticated users can delete cashout" 
ON public.cashout 
FOR DELETE 
USING (true);

-- Create trigger for cashout updated_at
CREATE TRIGGER update_cashout_updated_at
BEFORE UPDATE ON public.cashout
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update saldo when transaction is created
CREATE OR REPLACE FUNCTION public.update_saldo_after_transaksi()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Add to saldo when transaction is inserted
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET saldo = saldo + NEW.total_setoran
    WHERE id = NEW.nasabah_id;
  END IF;
  
  -- Handle updates
  IF TG_OP = 'UPDATE' THEN
    UPDATE public.profiles
    SET saldo = saldo - OLD.total_setoran + NEW.total_setoran
    WHERE id = NEW.nasabah_id;
  END IF;
  
  -- Handle deletes
  IF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET saldo = saldo - OLD.total_setoran
    WHERE id = OLD.nasabah_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for transaksi
CREATE TRIGGER trigger_update_saldo_transaksi
AFTER INSERT OR UPDATE OR DELETE ON public.transaksi
FOR EACH ROW
EXECUTE FUNCTION public.update_saldo_after_transaksi();

-- Function to update saldo when cashout is created
CREATE OR REPLACE FUNCTION public.update_saldo_after_cashout()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Subtract from saldo when cashout is inserted
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET saldo = saldo - NEW.jumlah
    WHERE id = NEW.nasabah_id;
  END IF;
  
  -- Handle updates
  IF TG_OP = 'UPDATE' THEN
    UPDATE public.profiles
    SET saldo = saldo + OLD.jumlah - NEW.jumlah
    WHERE id = NEW.nasabah_id;
  END IF;
  
  -- Handle deletes
  IF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET saldo = saldo + OLD.jumlah
    WHERE id = OLD.nasabah_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for cashout
CREATE TRIGGER trigger_update_saldo_cashout
AFTER INSERT OR UPDATE OR DELETE ON public.cashout
FOR EACH ROW
EXECUTE FUNCTION public.update_saldo_after_cashout();