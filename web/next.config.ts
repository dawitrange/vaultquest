import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    maximumRedirects: 0,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shared.akamai.steamstatic.com",
        port: "",
        pathname: "/store_item_assets/steam/apps/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
