import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/neroverse',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
