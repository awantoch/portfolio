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
}

module.exports = nextConfig 