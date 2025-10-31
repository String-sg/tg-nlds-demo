import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: {
    position: 'bottom-right',
  },
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
}

export default nextConfig
