-- Insert brands for MD Electronics
INSERT INTO brands (id, name, slug, logo_url, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'Samsung', 'samsung', '/placeholder.svg?height=50&width=100', true, now(), now()),
(gen_random_uuid(), 'LG', 'lg', '/placeholder.svg?height=50&width=100', true, now(), now()),
(gen_random_uuid(), 'Whirlpool', 'whirlpool', '/placeholder.svg?height=50&width=100', true, now(), now()),
(gen_random_uuid(), 'Bosch', 'bosch', '/placeholder.svg?height=50&width=100', true, now(), now()),
(gen_random_uuid(), 'Sony', 'sony', '/placeholder.svg?height=50&width=100', true, now(), now()),
(gen_random_uuid(), 'Panasonic', 'panasonic', '/placeholder.svg?height=50&width=100', true, now(), now()),
(gen_random_uuid(), 'Haier', 'haier', '/placeholder.svg?height=50&width=100', true, now(), now()),
(gen_random_uuid(), 'Electrolux', 'electrolux', '/placeholder.svg?height=50&width=100', true, now(), now());
