import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const api = 'http://127.0.0.1:3210';

export default defineConfig({
  root: 'web',
  plugins: [react()],
  build: {outDir: '../dist/web', emptyOutDir: true},
  server: {
    port: 5173,
    // Giao diện import trực tiếp composition trong src/remotion để xem trước
    fs: {allow: [projectRoot]},
    proxy: {'/api': api, '/media': api, '/renders': api},
  },
});
