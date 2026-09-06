# VetConnect website

Marketing and booking site for the **urban pet consultation** business. The
livestock side of VetConnect is a separate mobile app and does not live here.

Next.js 16 App Router with `output: "export"` — there is no server at runtime,
so no API routes, no server actions, no dynamic rendering. Anything that needs
a server goes in `functions/` as a Cloudflare Pages Function instead.

## Constraints

- **Static export only.** Anything requiring a server will fail at build time.
- **Server-side work goes in `functions/`,** not in `src/app/api`. Those are
  Cloudflare Workers with their own `tsconfig.json` (Workers types, not DOM);
  the root `tsconfig.json` excludes the directory. See PAYMENTS.md.
- **Secrets never enter `src/`.** Anything the frontend imports ends up in the
  JS bundle. `NEXT_PUBLIC_*` is public by definition.
- **`next/image` is unoptimized** (no image server). Size and compress images
  before committing them to `public/images/`.
- **No base path.** The site is served from the root of vetconnect.co.in. Do not
  set `NEXT_PUBLIC_BASE_PATH` — it would prefix every asset URL and break them.

## Conventions

- Colours come from the `@theme` block in `src/app/globals.css`. Use the generated
  utilities (`bg-brand`, `text-ink-muted`). Don't hard-code hex values in components.
- Page sections live in `src/components/sections/`, one file per section.
- Reusable primitives live in `src/components/ui/`.
- Use `cn()` from `@/lib/utils` when composing conditional class names.
- Components are server components by default. Only add `"use client"` where a
  component genuinely needs state, effects or browser APIs.

## Checks

```bash
npm run lint
npm run build
```

Both must pass before pushing — `main` deploys automatically.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
