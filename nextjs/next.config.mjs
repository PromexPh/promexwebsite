/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'randomuser.me' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'media.licdn.com' },
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
