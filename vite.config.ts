import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';
import { resolve } from 'path';

const isElectronBuild = process.env.ELECTRON === 'true';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(!isElectronBuild
      ? [
          VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'auto',
            devOptions: { enabled: false },
            workbox: {
              // Include font assets (e.g. KaTeX) so the SW precaches them; omitting them can cause
              // broken font requests when offline or with aggressive caching.
              globPatterns: ['**/*.{js,css,html,svg,json,woff2,woff,ttf,mjs}'],
            },
            includeAssets: ['favicon.svg'],
            manifest: false,
          }),
        ]
      : []),
    ...(isElectronBuild
      ? [
          electron([
            {
              entry: 'electron/main.ts',
              onstart(options) {
                options.startup();
              },
              vite: {
                build: {
                  outDir: 'dist-electron',
                  rollupOptions: { external: ['electron'] },
                },
              },
            },
            {
              entry: 'electron/preload.ts',
              onstart(options) {
                options.reload();
              },
              vite: {
                build: {
                  outDir: 'dist-electron',
                  rollupOptions: { external: ['electron'] },
                },
              },
            },
          ]),
          renderer(),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  base: isElectronBuild ? './' : '/',
});
