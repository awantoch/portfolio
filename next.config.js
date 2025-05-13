/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
  },
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