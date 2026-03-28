import type { NextConfig } from "next";

/**
 * Nero Micro-Blogging
 * GitHub Pages Deployment Trigger
 */
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
