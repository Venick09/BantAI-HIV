import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  devIndicators: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs' module on the client to prevent this error on build
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        stream: false,
        zlib: false,
        querystring: false,
        path: false,
        'fs/promises': false,
      }
    }
    return config
  },
}

export default nextConfig
