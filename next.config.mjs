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
   * Pages and routes ending `.dev.tsx` / `.dev.ts` exist only while a developer
   * runs the app on their own machine. The authoring studio is one of them: it
   * reads a spreadsheet and writes files into src/data, so it belongs on the
   * machine that owns the source and nowhere else.
   *
   * Dropping them from the static export is what lets the studio have a real
   * password. A published page can only carry a password its own JavaScript
   * can check, which means shipping the answer alongside the question; here the
   * password stays in .env.local and is checked by the dev server.
   */
  pageExtensions: isStaticExport ? ["tsx", "ts"] : ["dev.tsx", "dev.ts", "tsx", "ts"],
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
