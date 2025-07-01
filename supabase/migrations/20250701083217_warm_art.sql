/*
  # Admin User Setup and RLS Policy Fix

  1. Security Updates
    - Fix RLS policies to properly check admin status
    - Add proper admin authentication checks
    - Enable secure admin operations

  2. Admin User Instructions
    - Provides instructions for creating admin user
    - Sets up proper metadata for admin access
*/

-- Update RLS policies to use proper admin authentication
-- These policies will work with both user_metadata and app_metadata

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Allow admin CUD on categories" ON categories;
DROP POLICY IF EXISTS "Allow admin CUD on brands" ON brands;
DROP POLICY IF EXISTS "Allow admin CUD on products" ON products;
DROP POLICY IF EXISTS "Allow admin CUD on orders" ON orders;
DROP POLICY IF EXISTS "Allow admin CUD on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow admin CUD on reviews" ON reviews;

-- Create comprehensive admin policies for all operations
-- Categories admin policies
CREATE POLICY "Admin full access on categories" ON categories
    FOR ALL 
    TO authenticated
    USING (
        COALESCE(
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin',
            (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin',
            'false'
        ) = 'true'
    );

-- Brands admin policies  
CREATE POLICY "Admin full access on brands" ON brands
    FOR ALL 
    TO authenticated
    USING (
        COALESCE(
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin',
            (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin',
            'false'
        ) = 'true'
    );

-- Products admin policies
CREATE POLICY "Admin full access on products" ON products
    FOR ALL 
    TO authenticated
    USING (
        COALESCE(
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin',
            (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin',
            'false'
        ) = 'true'
    );

-- Orders admin policies
CREATE POLICY "Admin full access on orders" ON orders
    FOR ALL 
    TO authenticated
    USING (
        COALESCE(
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin',
            (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin',
            'false'
        ) = 'true'
    );

-- Order items admin policies
CREATE POLICY "Admin full access on order_items" ON order_items
    FOR ALL 
    TO authenticated
    USING (
        COALESCE(
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin',
            (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin',
            'false'
        ) = 'true'
    );

-- Reviews admin policies
CREATE POLICY "Admin full access on reviews" ON reviews
    FOR ALL 
    TO authenticated
    USING (
        COALESCE(
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'is_admin',
            (auth.jwt() ->> 'app_metadata')::jsonb ->> 'is_admin',
            'false'
        ) = 'true'
    );

-- Instructions for creating admin user:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to Authentication > Users
-- 3. Click "Add user"
-- 4. Enter email: admin@mdelectronics.com
-- 5. Enter a secure password
-- 6. After creating the user, run this SQL to make them admin:

-- UPDATE auth.users 
-- SET user_metadata = user_metadata || '{"is_admin": true}'::jsonb
-- WHERE email = 'admin@mdelectronics.com';

-- Verify admin user with:
-- SELECT email, user_metadata, app_metadata FROM auth.users WHERE email = 'admin@mdelectronics.com';