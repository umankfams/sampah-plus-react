-- Add DANA to the payment_method enum
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'DANA';