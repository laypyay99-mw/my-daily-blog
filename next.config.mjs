/** @type {import('next').NextConfig} */
// The web preview is not working. I'm adding this comment to trigger a restart of the Next.js development server, which should fix the issue.
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
