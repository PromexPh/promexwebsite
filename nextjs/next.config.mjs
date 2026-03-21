/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/facebook',
        destination: 'https://www.facebook.com/promexph', // TODO: replace with real URL
        permanent: false,
      },
      {
        source: '/linkedin',
        destination: 'https://www.linkedin.com/company/promexph', // TODO: replace with real URL
        permanent: false,
      },
      {
        source: '/instagram',
        destination: 'https://www.instagram.com/promexph', // TODO: replace with real URL
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
