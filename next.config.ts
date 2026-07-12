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
};

export default nextConfig;
