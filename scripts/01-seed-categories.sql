-- Insert categories for MD Electronics
INSERT INTO categories (id, name, slug, description, image_url, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'Refrigerators', 'refrigerators', 'Keep your food fresh with our range of energy-efficient refrigerators', '/placeholder.svg?height=100&width=100', true, now(), now()),
(gen_random_uuid(), 'Ovens', 'ovens', 'Professional cooking with our premium oven collection', '/placeholder.svg?height=100&width=100', true, now(), now()),
(gen_random_uuid(), 'Televisions', 'televisions', 'Experience entertainment like never before with our smart TVs', '/placeholder.svg?height=100&width=100', true, now(), now()),
(gen_random_uuid(), 'Air Conditioners', 'air-conditioners', 'Stay cool and comfortable with our efficient AC units', '/placeholder.svg?height=100&width=100', true, now(), now()),
(gen_random_uuid(), 'Washing Machines', 'washing-machines', 'Advanced laundry solutions for modern homes', '/placeholder.svg?height=100&width=100', true, now(), now()),
(gen_random_uuid(), 'Deep Freezers', 'deep-freezers', 'Preserve your food for longer with our deep freezer collection', '/placeholder.svg?height=100&width=100', true, now(), now());
