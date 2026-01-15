import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nyzowtppyojkqqzquuud.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
