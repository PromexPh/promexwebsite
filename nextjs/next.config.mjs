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
        destination: 'https://www.facebook.com/p/Promex-Philippines-100085889786889/', 
        permanent: false,
      },
      {
        source: '/linkedin',
        destination: 'https://www.linkedin.com/company/promexph', 
        permanent: false,
      },
      {
        source: '/instagram',
        destination: 'https://www.instagram.com/promexphilippines/', 
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      // Standalone landing page served as a static file, outside the app layout
      { source: '/domestic', destination: '/domestic/index.html' },
      { source: '/domestic/', destination: '/domestic/index.html' },
    ];
  },
};

export default nextConfig;
