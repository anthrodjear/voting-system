/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for smaller Docker image
  output: 'standalone',
  
  reactStrictMode: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
    ],
  },
  
  // Environment variables exposed to the browser
  env: {
    APP_NAME: process.env.APP_NAME || 'IEBC Voting System',
    API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
