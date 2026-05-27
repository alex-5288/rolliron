/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  // Next.js 16 uses Turbopack by default. No custom config needed —
  // Turbopack handles CJS modules (including __dirname) natively.
  turbopack: {},
};

module.exports = nextConfig;
