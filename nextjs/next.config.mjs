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
      // Old landing page URLs
      { source: '/domestic', destination: '/en/domestic', permanent: true },
      { source: '/domestic/', destination: '/en/domestic', permanent: true },
      { source: '/domestic/tl', destination: '/tl/domestic', permanent: true },
      { source: '/domestic/tl/', destination: '/tl/domestic', permanent: true },
    ];
  },
  async rewrites() {
    return [
      // Standalone landing pages served as static files, outside the app layout
      { source: '/en/domestic', destination: '/en/domestic/index.html' },
      { source: '/en/domestic/', destination: '/en/domestic/index.html' },
      { source: '/tl/domestic', destination: '/tl/domestic/index.html' },
      { source: '/tl/domestic/', destination: '/tl/domestic/index.html' },
    ];
  },
};

export default nextConfig;
