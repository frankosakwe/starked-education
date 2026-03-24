/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS: process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS,
  },
}

module.exports = nextConfig
