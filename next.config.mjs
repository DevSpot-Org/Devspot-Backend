/** @type {import('next').NextConfig} */
import "./src/lib/config/env.js";
const nextConfig = {
  /* config options here */
  webpack: (config) => {
    config.cache = true; // Enable Webpack caching
    return config;
  },
  redirects: async () => [
    {
      source: "/:path*",
      has: [{ type: "host", value: `www.${process.env.VERCEL_URL}` }],
      destination: `${process.env.NEXT_PUBLIC_PROTOCOL}${process.env.VERCEL_URL}/:path*`,
      permanent: true,
    },
  ],
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.ALLOWED_ORIGIN,
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
