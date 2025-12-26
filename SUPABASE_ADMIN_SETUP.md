Supabase Admin Setup

1) Create a Supabase project
- Go to https://app.supabase.com and create a free project.

2) Create the `users` table
- Open "SQL Editor" in Supabase and run the contents of `supabase_schema.sql` in the repo.

3) Create an Auth user for the seeded admin (recommended)
- In the Supabase dashboard go to "Authentication" → "Users" → "Invite user" or manually sign up the admin using the Auth UI.
- After creating the Auth user note the `id` (Auth user id).
- Update the `users` table row for the admin to set `auth_user_id` to that id, e.g.:

  update users set auth_user_id = 'AUTH_USER_ID' where email = 'websitesbrian585@gmail.com';

4) Configure the frontend
- In the repository copy `assets/config.example.js` to `assets/config.js` and fill `SUPABASE_URL` and `SUPABASE_ANON_KEY` with values from your Supabase project settings.
- Keep `assets/config.js` out of public VCS if it contains real keys (or use environment secrets when deploying).

5) Test locally
- Start a static server and open the site. The frontend will detect `window.APP_CONFIG` and connect to Supabase.

6) Notes on auth
- The frontend uses `window._DB.auth` to sign up/sign in. For production use Supabase Auth flows and avoid storing passwords on the client.
- For writers, the frontend will create a `users` profile row with `active=false` (0) and require activation via payment/admin.
