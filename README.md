# VetConnect — website

Marketing site for VetConnect: two-tier veterinary dispatch for rural India.

Static, UI-only. No backend, no data collection.

**Live:** https://ansuljain.github.io/vetconnect/

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Hosting | GitHub Pages, deployed by GitHub Actions |

## Running locally

```bash
npm install
npm run dev
```

Opens on http://localhost:3000. Locally the site serves from `/`; in production it
serves from `/vetconnect/` (see *Base path* below).

```bash
npm run build     # static export into ./out
npm run lint
```

## Project structure

```
src/
├── app/
│   ├── layout.tsx        Root layout, metadata
│   ├── page.tsx          Home page
│   └── globals.css       Tailwind import + design tokens
├── components/
│   ├── sections/         Page sections — Hero, Problem, Solution, …
│   ├── ui/               Reusable primitives — Button, Container, …
│   └── layout/           Header, Footer
└── lib/
    └── utils.ts          cn() class merge helper

public/
├── images/               Static images
└── .nojekyll             Stops Pages ignoring the _next/ directory

.github/workflows/
└── deploy.yml            Build + deploy on push to main
```

## Design tokens

Colours live in `src/app/globals.css` under `@theme`, which makes them available
as Tailwind utilities — `--color-brand` becomes `text-brand`, `bg-brand`, etc.

Change a token there and it updates everywhere. Don't hard-code hex values in
components.

## Base path

The site is served from a subdirectory (`ansuljain.github.io/vetconnect`), not a
domain root, so asset URLs need a `/vetconnect` prefix. This is handled by the
`NEXT_PUBLIC_BASE_PATH` environment variable:

- **Local dev** — unset, so the site serves from `/`
- **CI build** — set to `/vetconnect` in `.github/workflows/deploy.yml`

If a custom domain is added later, delete that env var from the workflow and the
prefix disappears on its own. Nothing else needs to change.

## Deployment

Push to `main`. The workflow builds the static export and publishes it to Pages.

First-time setup, once, in the GitHub UI:

**Settings → Pages → Build and deployment → Source → GitHub Actions**

Without that, the workflow builds successfully but has nowhere to publish.
