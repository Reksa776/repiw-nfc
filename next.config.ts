import type { NextConfig } from 'next';

const config: NextConfig = {
  distDir: process.env.REPIW_NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['pg', 'archiver'],
};

export default config;
