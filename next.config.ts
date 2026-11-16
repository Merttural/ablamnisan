import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/ani-birak",
        permanent: true,
      },
    ];
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    qualities: [75, 80, 85],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
