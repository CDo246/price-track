// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/trpc/:path*",
        destination: `http://localhost:3030/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
