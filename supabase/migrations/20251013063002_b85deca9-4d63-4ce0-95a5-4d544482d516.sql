-- Add payment method columns to cashout table
CREATE TYPE public.payment_method AS ENUM ('Cash', 'Gopay', 'OVO', 'ShopeePay');

ALTER TABLE public.cashout
ADD COLUMN metode_pembayaran payment_method NOT NULL DEFAULT 'Cash',
ADD COLUMN nomor_akun text;