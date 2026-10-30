import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  images: {
    // The showcase band is full-bleed on a phone, where 75 shows its edges.
    qualities: [75, 90, 95],
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
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/DOMO/about', destination: '/domo-site/about/index.html' },
        {
          source: '/DOMO/business-solutions',
          destination: '/domo-site/business-solutions/index.html',
        },
        {
          source: '/DOMO/contact',
          destination: '/domo-site/contact/index.html',
        },
        {
          source: '/DOMO/contract',
          destination: '/domo-site/contract/index.html',
        },
        { source: '/DOMO', destination: '/domo-site/index.html' },
        { source: '/DOMO/living', destination: '/domo-site/living/index.html' },
        {
          source: '/DOMO/news/100-hotel-show',
          destination: '/domo-site/news/100-hotel-show/index.html',
        },
        {
          source: '/DOMO/news/eight-decades-of-wood',
          destination: '/domo-site/news/eight-decades-of-wood/index.html',
        },
        { source: '/DOMO/news', destination: '/domo-site/news/index.html' },
        {
          source: '/DOMO/news/living-kolonaki',
          destination: '/domo-site/news/living-kolonaki/index.html',
        },
        {
          source: '/DOMO/news/xenia-2025',
          destination: '/domo-site/news/xenia-2025/index.html',
        },
        {
          source: '/DOMO/our-products',
          destination: '/domo-site/our-products/index.html',
        },
        {
          source: '/DOMO/our-team',
          destination: '/domo-site/our-team/index.html',
        },
        {
          source: '/DOMO/projects',
          destination: '/domo-site/projects/index.html',
        },
        {
          source: '/DOMO/projects/one-and-only-aesthesis',
          destination: '/domo-site/projects/one-and-only-aesthesis/index.html',
        },
        {
          source: '/DOMO/projects/patiris-store',
          destination: '/domo-site/projects/patiris-store/index.html',
        },
        {
          source: '/DOMO/projects/the-foundry-hotel-athens',
          destination:
            '/domo-site/projects/the-foundry-hotel-athens/index.html',
        },
        {
          source: '/DOMO/styleguide',
          destination: '/domo-site/styleguide/index.html',
        },
        { source: '/DOMO/:path*', destination: '/domo-site/:path*' },
      ],
    };
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
