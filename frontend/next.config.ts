import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  trailingSlash: false,
  output: "standalone",
};

export default nextConfig;