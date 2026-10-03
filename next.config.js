/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Browsers and crawlers still request /favicon.ico directly.
    return [{ source: '/favicon.ico', destination: '/favicon.svg' }]
  },
};

module.exports = nextConfig;
