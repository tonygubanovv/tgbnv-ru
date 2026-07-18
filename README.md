# t-gubanov.ru

Personal static site with content collections, Decap CMS editing, SEO defaults, and GitHub Pages deployment.

## What is inside

- Astro 7 static build
- MDX articles and cases for reusable content blocks
- Decap CMS admin at `/admin/`
- GitHub Pages workflow in `.github/workflows/deploy.yml`
- Custom domain placeholder in `public/CNAME`
- SEO metadata, sitemap-friendly static routes, Open Graph defaults

## Local work

```powershell
npm install
npm run dev
```

Open `http://localhost:4321`.

## Publishing

Push to the `main` branch. GitHub Actions builds the site and publishes it to GitHub Pages.

Before production content editing, update `public/admin/config.yml`:

- replace `OWNER/tgbnv-ru` with the real GitHub repository path
- configure a Decap CMS GitHub OAuth proxy or move auth to a provider that supplies Git Gateway

The site itself stays static and does not need a database or server.
