/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Explicitly disable the App Router to use Pages Router
  experimental: {
    appDir: false,
  },
  env: {
    // You'll need to set this in your .env.local file or Vercel environment variables
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  },
}

module.exports = nextConfig 