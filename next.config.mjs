/**
 * The workspace has no server-side features (no API routes, no auth, no server
 * actions), so it can be exported as plain static files and hosted anywhere —
 * including a subfolder of a personal website.
 *
 *   npm run build          normal Next.js build, served with `npm run start`
 *   npm run build:static   static export into ./out, served by any web server
 *
 * When hosting under a subfolder, set the base path:
 *   NEXT_PUBLIC_BASE_PATH=/fa npm run build:static
 */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  /*
   * Routes ending `.dev.ts` exist only when a developer is running the app on
   * their own machine — the studio writes project files through one of them.
   * They are dropped from the static export, which is why the published site
   * keeps its promise of having no server side at all.
   */
  pageExtensions: isStaticExport ? ["tsx", "ts"] : ["dev.ts", "tsx", "ts"],
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
        /*
         * Keep the export out of `.next`. The dev server and the static export
         * produce different artefacts for the same routes, so sharing one
         * build directory leaves whichever ran last with a half-overwritten
         * cache — which surfaces as "Cannot find module './261.js'".
         */
        distDir: ".next-export",
      }
    : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
