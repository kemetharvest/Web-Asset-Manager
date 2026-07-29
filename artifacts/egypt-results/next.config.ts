import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow Replit's proxied dev domains
  allowedDevOrigins: ['*.replit.dev', '*.replit.app', '*.riker.replit.dev'],
  distDir: '.next',
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Ensure the pre-loaded Excel data file is bundled into the serverless functions
  outputFileTracingIncludes: {
    '/api/**': ['./data/**'],
  },
};

export default nextConfig;
