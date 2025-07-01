-- Insert sample orders
WITH sample_orders AS (
  INSERT INTO orders (
    id, customer_name, customer_email, customer_phone, 
    shipping_address, billing_address, total_amount, 
    status, payment_status, payment_method, created_at, updated_at
  ) VALUES
  (
    uuid_generate_v4(), 'John Doe', 'john@example.com', '+1 234 567 8900',
    '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}',
    '{"street": "123 Main St", "city": "New York", "state": "NY", "zip": "10001", "country": "USA"}',
    1299.99, 'completed', 'paid', 'credit_card',
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
  ),
  (
    uuid_generate_v4(), 'Jane Smith', 'jane@example.com', '+1 234 567 8901',
    '{"street": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zip": "90210", "country": "USA"}',
    '{"street": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zip": "90210", "country": "USA"}',
    899.99, 'shipped', 'paid', 'paypal',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
  ),
  (
    uuid_generate_v4(), 'Bob Johnson', 'bob@example.com', '+1 234 567 8902',
    '{"street": "789 Pine St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}',
    '{"street": "789 Pine St", "city": "Chicago", "state": "IL", "zip": "60601", "country": "USA"}',
    1599.99, 'pending', 'pending', 'bank_transfer',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  ),
  (
    uuid_generate_v4(), 'Alice Brown', 'alice@example.com', '+1 234 567 8903',
    '{"street": "321 Elm St", "city": "Miami", "state": "FL", "zip": "33101", "country": "USA"}',
    '{"street": "321 Elm St", "city": "Miami", "state": "FL", "zip": "33101", "country": "USA"}',
    749.99, 'processing', 'paid', 'credit_card',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
  )
  RETURNING id, customer_name, total_amount
)
SELECT * FROM sample_orders;

-- Insert sample order items (this would need to be done with actual product IDs)
-- For now, we'll add a comment about how to do this once products are seeded
-- INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
-- SELECT o.id, p.id, 1, p.price, p.price
-- FROM orders o, products p 
-- WHERE o.customer_email = 'john@example.com' AND p.slug = 'samsung-french-door-28'
-- LIMIT 1;
