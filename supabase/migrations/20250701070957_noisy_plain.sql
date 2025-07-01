-- Create an admin user in Supabase Auth
-- This script should be run in the Supabase SQL editor after running the previous scripts

-- Note: This is a template. You'll need to replace the email and password with your desired admin credentials
-- The user will be created with is_admin = true in their user_metadata

-- First, you need to create the user through Supabase Auth (this can't be done via SQL)
-- Go to Authentication > Users in your Supabase dashboard and create a new user
-- Then run this SQL to update their metadata:

-- Example (replace 'admin@mdelectronics.com' with your actual admin email):
-- UPDATE auth.users 
-- SET user_metadata = user_metadata || '{"is_admin": true}'::jsonb
-- WHERE email = 'admin@mdelectronics.com';

-- Alternative: You can also set it in app_metadata (requires service role)
-- UPDATE auth.users 
-- SET app_metadata = app_metadata || '{"is_admin": true}'::jsonb
-- WHERE email = 'admin@mdelectronics.com';

-- Instructions:
-- 1. Go to your Supabase dashboard
-- 2. Navigate to Authentication > Users
-- 3. Click "Add user" 
-- 4. Enter email: admin@mdelectronics.com (or your preferred admin email)
-- 5. Enter a secure password
-- 6. After creating the user, run one of the UPDATE statements above in the SQL editor
-- 7. Replace 'admin@mdelectronics.com' with the actual email you used

-- You can verify the admin user was created correctly by running:
-- SELECT email, user_metadata, app_metadata FROM auth.users WHERE email = 'admin@mdelectronics.com';