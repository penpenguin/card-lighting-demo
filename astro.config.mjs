// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
const base = process.env.BASE_PATH ?? '/';
const site = process.env.SITE_URL || undefined;

export default defineConfig({
  site: site,
  base: base,
  vite: {
    optimizeDeps: {
      exclude: ['vitest'],
    },
    ssr: {
      external: ['vitest'],
    },
  },
});
