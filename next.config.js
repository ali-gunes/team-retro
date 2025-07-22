/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_PARTYKIT_HOST: process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999',
  },
  // For production deployment, we'll use the deployed PartyKit URL
  async rewrites() {
    return [
      {
        source: '/party/:path*',
        destination: process.env.NEXT_PUBLIC_PARTYKIT_HOST 
          ? `https://${process.env.NEXT_PUBLIC_PARTYKIT_HOST}/party/:path*`
          : '/party/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
}

module.exports = nextConfig 