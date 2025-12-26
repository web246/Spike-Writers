# Deployment & Supabase setup

This file explains how to deploy the static site to GitHub Pages and connect a Supabase project for persistent user data and auth.

1) Quick local preview

```powershell
python -m http.server 8000
# open http://localhost:8000
```

2) Connect Supabase (recommended)

- Create a free project at https://app.supabase.com
- Create a `users` table with columns:
  - `id` (bigint, auto-increment) primary key
  - `email` (text)
  - `name` (text)
  - `role` (text)
  - `joined_at` (date or text)
  - `active` (boolean)
  - `auth_user_id` (text, optional)

- SQL example:

```sql
create table users (
  id bigserial primary key,
  email text unique not null,
  name text,
  role text,
  joined_at date,
  active boolean default true,
  auth_user_id text
);
```

-- Insert a site admin (change password to a secure hashed value if using server-side auth)
INSERT INTO users (email, name, role, joined_at, active) VALUES ('websitesbrian585@gmail.com', 'Brian Webs', 'admin', now()::date, true);

- In Supabase project settings get `Project URL` and `anon public API key`.
- Copy `assets/config.example.js` to `assets/config.js` and set `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

3) Deploy to GitHub Pages

- Push your repository to GitHub (main branch).
- The included GitHub Action (`.github/workflows/deploy.yml`) will publish the repository root to the `gh-pages` branch on push to `main` using `GITHUB_TOKEN`.
- After the workflow runs, enable GitHub Pages in the repository settings to serve from the `gh-pages` branch.

4) Notes

- For production auth, use Supabase Auth flows. The frontend will use `window._DB.auth` if Supabase config is present.
- Keep `assets/config.js` out of version control for real secrets; instead use GitHub secrets for server-side operations if needed.
