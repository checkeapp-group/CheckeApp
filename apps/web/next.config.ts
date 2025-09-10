import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
      {
        source: '/rpc/:path*',
        destination: 'http://localhost:3000/rpc/:path*',
      },
    ];
  },
};

export default nextConfig;
