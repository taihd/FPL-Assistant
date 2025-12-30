import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Get base path for GitHub Pages
// For project sites: /repository-name/
// For user/organization sites: /
function getBasePath(): string {
  if (process.env.GITHUB_PAGES && process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
    return repoName ? `/${repoName}/` : '/';
  }
  return '/';
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: getBasePath(),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/fpl': {
        target: 'https://fantasy.premierleague.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fpl/, '/api'),
        secure: true,
      },
    },
  },
});

