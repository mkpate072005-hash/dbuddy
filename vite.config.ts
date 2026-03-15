import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()];
  try {
    // @ts-ignore
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {}
  return {
    plugins,
    server: {
      proxy: {
        // Proxy /api/* to Vercel dev server on port 3000 when running locally
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        }
      }
    }
  };
})
