import type { NextConfig } from 'next';

// API server URL — set API_URL env var when deploying to Vercel
// (point it at your deployed Express API, e.g. https://your-api.railway.app)
const API_URL = process.env.API_URL ?? 'http://localhost:8080';

const nextConfig: NextConfig = {
  // Proxy /api/* to the Express API server (dev and SSR)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
  // Allow Replit's proxied dev domains
  allowedDevOrigins: ['*.replit.dev', '*.replit.app', '*.riker.replit.dev'],
  // Output directory
  distDir: '.next',
  // Experimental features for Next.js 15
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
