-- Insert brands for MD Electronics
INSERT INTO brands (id, name, slug, logo_url, is_active, created_at, updated_at) VALUES
(uuid_generate_v4(), 'Samsung', 'samsung', '/placeholder.svg?height=50&width=100', true, now(), now()),
(uuid_generate_v4(), 'LG', 'lg', '/placeholder.svg?height=50&width=100', true, now(), now()),
(uuid_generate_v4(), 'Whirlpool', 'whirlpool', '/placeholder.svg?height=50&width=100', true, now(), now()),
(uuid_generate_v4(), 'Bosch', 'bosch', '/placeholder.svg?height=50&width=100', true, now(), now()),
(uuid_generate_v4(), 'Sony', 'sony', '/placeholder.svg?height=50&width=100', true, now(), now()),
(uuid_generate_v4(), 'Panasonic', 'panasonic', '/placeholder.svg?height=50&width=100', true, now(), now()),
(uuid_generate_v4(), 'Haier', 'haier', '/placeholder.svg?height=50&width=100', true, now(), now()),
(uuid_generate_v4(), 'Electrolux', 'electrolux', '/placeholder.svg?height=50&width=100', true, now(), now());
