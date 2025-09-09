-- Fix security issues: Enable RLS on tables that have policies but RLS disabled
-- This addresses the critical ERROR level security warnings

-- Enable RLS on districts table if not already enabled
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on communities table if not already enabled  
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;