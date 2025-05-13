/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  server: {
    host: '0.0.0.0',  // 允许从本地IP访问
    port: 3000,       // 默认端口
  },
}

export default nextConfig
