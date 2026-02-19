import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },

  // Set base path for all assets
  basePath: process.env.PAGES_BASE_PATH, 
  assetPrefix: process.env.PAGES_BASE_PAT,

};

export default nextConfig;
