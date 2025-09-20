/** @type {import('next').NextConfig} */

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
};

export default nextConfig;
