/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['pps.whatsapp.net', 'drive.google.com'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb',
    },
  },
};

module.exports = nextConfig;
