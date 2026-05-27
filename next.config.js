/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // serverActions moved out of experimental in Next.js 15+
  serverActions: {
    bodySizeLimit: '2mb',
  },
  // Next.js 16 uses Turbopack by default. No custom config needed —
  // Turbopack handles CJS modules (including __dirname) natively.
  turbopack: {},
};

module.exports = nextConfig;
