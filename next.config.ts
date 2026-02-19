import type { NextConfig } from "next";
//const repo = "NextBlackHole"; //outdated
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: process.env.PAGES_BASE_PATH, //`/${repo}`,
  assetPrefix: process.env.PAGES_BASE_PATH//`/${repo}/`,

};

export default nextConfig;
