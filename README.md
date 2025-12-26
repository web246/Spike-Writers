# Spark Writers

Writers & Clients Marketplace

This repository scaffolds the Spark Writers platform. Implement authentication, M-Pesa Daraja integration (STK Push), writer profiles, dashboards, and admin moderation.

Setup (dev):

1. Copy `.env.example` to `.env` and set DB and Daraja / OAuth credentials. Use `spark_db` as the database name.
2. Run a PHP dev server from project root:

```powershell
php -S localhost:8000 -t public
```

# Spark Writers

This repository contains the static HTML/CSS/JS export of the Spark Writers site and a small client-side demo DB with optional Supabase support.

Local preview

```powershell
python -m http.server 8000
# open http://localhost:8000
```

Publish to GitHub Pages (automatic via Actions)

1. Create a GitHub repository on github.com.
2. On your machine, initialize and push:

```powershell
git init
git add .
git commit -m "Initial static export"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

The included GitHub Actions workflow `.github/workflows/deploy_pages.yml` will run on push to `main` and publish the site to the `gh-pages` branch. GitHub Pages will serve the content from the `gh-pages` branch.

Important security notes

- Do not commit service_role or other secret keys. `assets/config.js` should only contain public values (Supabase anon key is public).
- If you want to remove the PHP backend files from the repo history, make a local backup (for example `server_backup/`) and remove them before the first commit, or use tools such as `git filter-branch` / `git filter-repo` to scrub history.

Need help? Tell me whether you want me to:

- Move the PHP files into `server_backup/` automatically before commit.
- Create a workflow that injects `assets/config.js` from GitHub Secrets at deploy time.
- Provide commands to make the repo private or to scrub secrets from history.

Enjoy — push to GitHub and the site will deploy automatically.

