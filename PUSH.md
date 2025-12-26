Push to GitHub and enable GitHub Pages

1) Initialize git (if not already)

```bash
git init
git add .
git commit -m "Initial static site conversion + Supabase support"
```

2) Create a repository on GitHub (via web UI) named `spark-writers` (or your preferred name).

3) Add remote and push to `main`

```bash
git remote add origin https://github.com/<your-username>/spark-writers.git
git branch -M main
git push -u origin main
```

4) The included GitHub Action `.github/workflows/deploy.yml` will run on push to `main` and publish the site to `gh-pages` branch.

5) After the workflow finishes, go to your GitHub repository Settings → Pages and enable Pages to serve from the `gh-pages` branch.

6) (Optional) Use Vercel for easier previews and custom domains:
- Install Vercel CLI: `npm i -g vercel`
- Run `vercel` from the project root and follow prompts.

Notes:
- Keep `assets/config.js` out of VCS if it contains real Supabase keys. Use GitHub Secrets and a replacement step in CI if you want to inject keys during deployment.
- If you prefer, I can create a small workflow to copy `assets/config.example.js` to `assets/config.js` from repository secrets; say if you want that, I'll add it next.
