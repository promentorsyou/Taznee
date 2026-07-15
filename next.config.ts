import type { NextConfig } from "next";

const isStaticExport = process.env.STATIC_EXPORT === "1";
// Set GITHUB_PAGES_REPO to the repo name (e.g. "Taznee") in CI so asset
// URLs resolve correctly when served from https://<user>.github.io/<repo>/.
const basePath = isStaticExport && process.env.GITHUB_PAGES_REPO ? `/${process.env.GITHUB_PAGES_REPO}` : "";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export",
        basePath,
        assetPrefix: basePath || undefined,
        trailingSlash: true,
      }
    : {}),
  images: {
    unoptimized: isStaticExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
  // `headers()` is not supported with output: "export" (no server to apply
  // them at request time) — GitHub Pages preview has no dynamic responses
  // to protect, so this is skipped there. The live (Vercel) deployment
  // always gets these.
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "DENY" },
                { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
              ],
            },
          ];
        },
      }),
};

export default nextConfig;
