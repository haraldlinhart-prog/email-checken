/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Blogartikel (suchmaschinen.pro) liegen als public/blog/<slug>/index.html, ihre kanonische URL endet auf "/".
  // Ohne diese Option leitet Next sie per 308 auf die Variante ohne "/" um. App-Seiten leitet middleware.ts um.
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // Browsers and crawlers still request /favicon.ico directly.
    return [{ source: '/favicon.ico', destination: '/favicon.svg' }]
  },
};

module.exports = nextConfig;
