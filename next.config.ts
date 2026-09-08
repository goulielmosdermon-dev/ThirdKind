import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    // The showcase band is full-bleed on a phone, where 75 shows its edges.
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
    ],
  },
  async redirects() {
    // The Last Sunny Day site moved off this domain; old Webflow links still circulate.
    return [
      {
        source: '/last-sunny-day',
        destination: 'https://lastsunnyday.com',
        permanent: true,
      },
      {
        source: '/last-sunny-day/:path*',
        destination: 'https://lastsunnyday.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
