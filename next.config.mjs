/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔑 FIXED: Next.js standard root option configuration
  devIndicators: {
    appIsrStatus: false, // Extra dev tracking logs off karne k liye
  },
  // Agar aapka version allows it directly at root:
  allowedDevOrigins: ['localhost:3000', '0.0.0.0:3000', '10.158.106.129:3000'],
  
  reactStrictMode: true,
  eslint: {
    // 🔑 Next.js ka standard tarika production build par linting ignore karne ka
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;