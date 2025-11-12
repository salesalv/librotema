/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Configurar turbopack para evitar problemas con múltiples lockfiles
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
}

export default nextConfig
