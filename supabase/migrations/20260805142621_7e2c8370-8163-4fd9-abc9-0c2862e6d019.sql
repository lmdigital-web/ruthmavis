UPDATE auth.users 
SET 
  encrypted_password = extensions.crypt('R@nger123$', extensions.gen_salt('bf')),
  email_confirmed_at = now(),
  last_sign_in_at = now()
WHERE email = 'ruth.mavis0803@gmail.com';