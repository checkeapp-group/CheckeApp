import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
      },
      {
        protocol: 'https',
        hostname: 'icons.duckduckgo.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'checkeapp.com',
      },
    ],
  },
  async rewrites() {
    const backendUrl = 'http://server:3000';
    return [
      {
        source: '/api/verifications/:path*',
        destination: '/api/verifications/:path*',
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/rpc/:path*',
        destination: `${backendUrl}/rpc/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/verifications/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
