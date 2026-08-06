# Publishing the workspace

The app has no backend, no database and no authentication, and every route prerenders to static
HTML. That means it can be hosted anywhere — including inside an existing personal website.

---

## Option A — Vercel (fastest, gives you a live URL)

Best when you want a link to put on a CV or a portfolio card.

1. Push the repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new), import the repository.
3. Accept every default (Vercel detects Next.js) and deploy.

You get `https://<project-name>.vercel.app`. Every push to `main` redeploys automatically.
A custom domain (`workspace.your-domain.com`) can be attached in the project settings.

---

## Option B — static export onto your own website

Produces a folder of plain files you can upload by FTP, drop into an existing site, or serve
from any host. No Node.js needed on the server.

### Hosting at the root of a domain

```bash
npm run build:static     # writes ./out
npm run preview:static   # check it locally on http://localhost:4000
```

Upload the contents of `out/` to your web root.

### Hosting in a subfolder

If the workspace will live at `https://your-site.com/projects/analyst-workspace/`, the app needs
to know its base path, otherwise CSS and JS resolve to the wrong URLs.

```bash
# macOS / Linux
NEXT_PUBLIC_BASE_PATH=/projects/analyst-workspace npm run build:static

# Windows PowerShell
$env:NEXT_PUBLIC_BASE_PATH="/projects/analyst-workspace"; npm run build:static
```

Then upload `out/` into that subfolder.

---

## Option C — GitHub Pages

Free, and the URL sits next to your source code.

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build:static
        env:
          NEXT_PUBLIC_BASE_PATH: /Functional-Analyst-Workspace
      - run: touch out/.nojekyll
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Then in the repository: **Settings → Pages → Source → GitHub Actions**.

Published at `https://<username>.github.io/Functional-Analyst-Workspace/`.

> The `NEXT_PUBLIC_BASE_PATH` must match the repository name, because Pages serves project sites
> from a subfolder.

---

## Embedding in an existing portfolio page

Once deployed, a project card can either link out or embed the live app:

```html
<a href="https://your-workspace-url.vercel.app" target="_blank" rel="noopener">
  Open the live workspace
</a>

<!-- or embed it inside your case-study page -->
<iframe
  src="https://your-workspace-url.vercel.app"
  title="Business Analyst Workspace"
  loading="lazy"
  style="width:100%;aspect-ratio:16/10;border:1px solid #e2e8f0;border-radius:12px"
></iframe>
```

An embedded frame is impressive but small; a **screenshot that links to the live app** usually
reads better on a portfolio grid, with the live link as the call to action.

---

## Screenshots worth capturing

For a portfolio card or a CV, these five pages carry the most signal:

| Page             | Why it lands                                                    |
| ---------------- | --------------------------------------------------------------- |
| `/traceability`  | The matrix — the artefact recruiters recognise as senior BA work |
| `/bpmn`          | A real swimlane process model, not a stock image                 |
| `/requirements`  | Acceptance criteria in Given/When/Then                           |
| `/swagger-api`   | Shows you can specify interfaces, not just write prose           |
| `/sql-validation`| Shows you evidence delivery, not just document it                |

Capture each in both light and dark mode — the theme toggle is in the top bar.
