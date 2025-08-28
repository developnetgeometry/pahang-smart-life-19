-- Add new roles for spouse and tenant accounts
ALTER TYPE enhanced_user_role ADD VALUE IF NOT EXISTS 'spouse';
ALTER TYPE enhanced_user_role ADD VALUE IF NOT EXISTS 'tenant';