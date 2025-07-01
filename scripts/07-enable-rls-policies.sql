-- Enable Row Level Security (RLS) for all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access on brands" ON brands;
DROP POLICY IF EXISTS "Allow public read access on products" ON products;
DROP POLICY IF EXISTS "Allow public read access on orders" ON orders;
DROP POLICY IF EXISTS "Allow public read access on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public read access on reviews" ON reviews;

-- Create policies for public read access (for the storefront)
CREATE POLICY "Allow public read access on categories" ON categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access on brands" ON brands
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access on products" ON products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access on reviews" ON reviews
    FOR SELECT USING (is_approved = true);

-- Admin policies (these would be used with service role key)
-- For now, we'll allow all operations for authenticated users
-- In production, you'd want more granular policies

-- Categories admin policies
CREATE POLICY "Allow admin full access on categories" ON categories
    FOR ALL USING (true);

-- Brands admin policies  
CREATE POLICY "Allow admin full access on brands" ON brands
    FOR ALL USING (true);

-- Products admin policies
CREATE POLICY "Allow admin full access on products" ON products
    FOR ALL USING (true);

-- Orders admin policies
CREATE POLICY "Allow admin full access on orders" ON orders
    FOR ALL USING (true);

-- Order items admin policies
CREATE POLICY "Allow admin full access on order_items" ON order_items
    FOR ALL USING (true);

-- Reviews admin policies
CREATE POLICY "Allow admin full access on reviews" ON reviews
    FOR ALL USING (true);

-- Grant necessary permissions to anon role for public access
GRANT SELECT ON categories TO anon;
GRANT SELECT ON brands TO anon;
GRANT SELECT ON products TO anon;
GRANT SELECT ON reviews TO anon;

-- Grant permissions to authenticated role (for admin operations)
GRANT ALL ON categories TO authenticated;
GRANT ALL ON brands TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;
GRANT ALL ON reviews TO authenticated;
