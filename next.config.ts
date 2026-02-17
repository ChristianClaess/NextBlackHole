import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  /* config options here */

  trailingSlash: true,
  images: { unoptimized: true },

  // needed for GitHub Pages project sites: https://username.github.io/repo/
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
};

export default nextConfig;
