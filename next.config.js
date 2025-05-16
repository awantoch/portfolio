/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wantoch.com',
      },
      {
        protocol: 'https',
        hostname: 'alec.wantoch.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/cal',
        destination: 'https://cal.com/alecw',
      },
    ];
  },
}

module.exports = nextConfig 