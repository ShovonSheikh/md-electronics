-- Update Row Level Security (RLS) policies for proper admin authentication
-- This script replaces the overly permissive policies with secure ones

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow admin full access on categories" ON categories;
DROP POLICY IF EXISTS "Allow admin full access on brands" ON brands;
DROP POLICY IF EXISTS "Allow admin full access on products" ON products;
DROP POLICY IF EXISTS "Allow admin full access on orders" ON orders;
DROP POLICY IF EXISTS "Allow admin full access on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow admin full access on reviews" ON reviews;

-- Create secure admin policies that check for admin role
-- These policies check if the authenticated user has is_admin = true in their metadata

-- Categories admin policies
CREATE POLICY "Allow admin CUD on categories" ON categories
    FOR ALL 
    TO authenticated
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true' OR
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin' = 'true'
    );

-- Brands admin policies  
CREATE POLICY "Allow admin CUD on brands" ON brands
    FOR ALL 
    TO authenticated
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true' OR
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin' = 'true'
    );

-- Products admin policies
CREATE POLICY "Allow admin CUD on products" ON products
    FOR ALL 
    TO authenticated
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true' OR
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin' = 'true'
    );

-- Orders admin policies
CREATE POLICY "Allow admin CUD on orders" ON orders
    FOR ALL 
    TO authenticated
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true' OR
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin' = 'true'
    );

-- Order items admin policies
CREATE POLICY "Allow admin CUD on order_items" ON order_items
    FOR ALL 
    TO authenticated
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true' OR
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin' = 'true'
    );

-- Reviews admin policies
CREATE POLICY "Allow admin CUD on reviews" ON reviews
    FOR ALL 
    TO authenticated
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin' = 'true' OR
        (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin' = 'true'
    );

-- Grant necessary permissions to authenticated role for admin operations
GRANT ALL ON categories TO authenticated;
GRANT ALL ON brands TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT ALL ON reviews TO authenticated;