import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // Fixa a raiz do workspace (há múltiplos lockfiles no ambiente).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
