/**
 * The workspace has no server-side features (no API routes, no auth, no server
 * actions), so it can be exported as plain static files and hosted anywhere —
 * including a subfolder of a personal website.
 *
 *   npm run build          normal Next.js build, served with `npm run start`
 *   npm run build:static   static export into ./out, served by any web server
 *
 * When hosting under a subfolder, set the base path:
 *   NEXT_PUBLIC_BASE_PATH=/projects/analyst-workspace npm run build:static
 */
const isStaticExport = process.env.STATIC_EXPORT === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  ...(isStaticExport
    ? {
        output: "export",
        trailingSlash: true,
        images: { unoptimized: true },
      }
    : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
