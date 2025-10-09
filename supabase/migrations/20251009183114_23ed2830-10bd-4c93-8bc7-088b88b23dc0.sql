-- Create profiles table for user data
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  no_induk text UNIQUE NOT NULL,
  no_hp text NOT NULL,
  nama text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create jenis_sampah table (waste types)
CREATE TABLE public.jenis_sampah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  harga_per_kg numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.jenis_sampah ENABLE ROW LEVEL SECURITY;

-- Jenis sampah policies - all authenticated users can view
CREATE POLICY "Authenticated users can view jenis sampah"
  ON public.jenis_sampah FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert jenis sampah"
  ON public.jenis_sampah FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update jenis sampah"
  ON public.jenis_sampah FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete jenis sampah"
  ON public.jenis_sampah FOR DELETE
  TO authenticated
  USING (true);

-- Create transaksi table (transactions)
CREATE TABLE public.transaksi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nasabah_id uuid REFERENCES public.profiles(id) NOT NULL,
  tanggal_transaksi date DEFAULT CURRENT_DATE NOT NULL,
  total_setoran numeric(10,2) DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.transaksi ENABLE ROW LEVEL SECURITY;

-- Transaksi policies
CREATE POLICY "Authenticated users can view all transactions"
  ON public.transaksi FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transactions"
  ON public.transaksi FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update transactions"
  ON public.transaksi FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete transactions"
  ON public.transaksi FOR DELETE
  TO authenticated
  USING (true);

-- Create transaksi_detail table (transaction items)
CREATE TABLE public.transaksi_detail (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaksi_id uuid REFERENCES public.transaksi(id) ON DELETE CASCADE NOT NULL,
  jenis_sampah_id uuid REFERENCES public.jenis_sampah(id) NOT NULL,
  jumlah_kg numeric(10,2) NOT NULL,
  harga_per_kg numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.transaksi_detail ENABLE ROW LEVEL SECURITY;

-- Transaksi detail policies
CREATE POLICY "Authenticated users can view transaction details"
  ON public.transaksi_detail FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert transaction details"
  ON public.transaksi_detail FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update transaction details"
  ON public.transaksi_detail FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete transaction details"
  ON public.transaksi_detail FOR DELETE
  TO authenticated
  USING (true);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jenis_sampah_updated_at
  BEFORE UPDATE ON public.jenis_sampah
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transaksi_updated_at
  BEFORE UPDATE ON public.transaksi
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();