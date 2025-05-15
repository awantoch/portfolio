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
  turbopack: {
    // Add MDX to resolve extensions
    resolveExtensions: ['.mdx', '.tsx', '.ts', '.jsx', '.js', '.json', '.css'],
  },
}

module.exports = nextConfig 