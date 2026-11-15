import { defineConfig, transformWithOxc } from 'vite';
import react from '@vitejs/plugin-react';

// پلاگینی که فایل‌های .js داخل src را مثل JSX پردازش می‌کند
const jsxInJsPlugin = () => ({
  name: 'jsx-in-js',
  enforce: 'pre',
  async transform(code, id) {
    // فقط فایل‌های .js داخل src را هدف بگیر
    if (!id.match(/src\/.*\.js$/)) return null;

   return await transformWithOxc(code, id, { lang: 'jsx' });
  },
});

export default defineConfig({
  plugins: [
    jsxInJsPlugin(),
    react(),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    global: 'globalThis',
  },
  server: {
    port: 3000,
    open: true,
  },
 build: {
  outDir: 'build',
  chunkSizeWarningLimit: 3000,
},
});