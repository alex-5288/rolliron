/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },
  webpack: (config) => {
    // Polyfill __dirname / __filename for CJS packages (e.g. @supabase)
    // that reference them inside webpack bundles compiled as ESM.
    config.node = {
      __dirname: true,
      __filename: true,
    };
    return config;
  },
};

module.exports = nextConfig;
