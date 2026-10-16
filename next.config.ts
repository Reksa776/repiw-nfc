import type { NextConfig } from 'next';

const config: NextConfig = {
  distDir: process.env.REPIW_NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  reactStrictMode: true,
  // Keep native/heavy server packages out of the bundle. `playwright-core` is imported
  // dynamically by the resolver worker path and must stay external on the server.
  serverExternalPackages: ['pg', 'archiver', 'playwright', 'playwright-core'],
};

export default config;
