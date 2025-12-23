import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.astrovia.id",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
