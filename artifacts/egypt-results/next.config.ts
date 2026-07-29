import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Proxy /api/* to the Express API server during development AND SSR
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
  // Allow Replit's proxied dev domains
  allowedDevOrigins: ['*'],
  // Output directory
  distDir: '.next',
  // Experimental features for Next.js 15
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
