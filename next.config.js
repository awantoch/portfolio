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
  async redirects() {
    return [
      {
        source: '/cal/:path*',
        destination: 'https://cal.com/alecw/:path*',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig 