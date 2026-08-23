import type { NextConfig } from "next";
import path from "node:path";

/**
 * Deployed as a fully static site to GitHub Pages.
 *
 * `NEXT_PUBLIC_BASE_PATH` is set to "/vetconnect" by the deploy workflow, because
 * the site is served from ansuljain.github.io/vetconnect rather than a domain root.
 * Locally it is unset, so `npm run dev` serves from "/" as normal.
 *
 * If a custom domain is added later, drop the env var from the workflow and the
 * base path disappears on its own.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // Pin the workspace root — there is a stray package.json in the home directory
  // that Turbopack would otherwise try to treat as the root.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  // Pages serves directories, so every route needs its own index.html.
  trailingSlash: true,
  images: {
    // next/image optimisation needs a server; there isn't one.
    unoptimized: true,
  },
};

export default nextConfig;
