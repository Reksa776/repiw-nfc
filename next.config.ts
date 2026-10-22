import type { NextConfig } from 'next';

const config: NextConfig = {
  distDir: process.env.REPIW_NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  reactStrictMode: true,
  // Keep native server packages out of the bundle.
  serverExternalPackages: ['pg', 'archiver'],
};

export default config;
