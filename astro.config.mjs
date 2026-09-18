// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';

// https://astro.build/config
export default defineConfig({
  // Workers serves the generated files through wrangler.jsonc.
  output: 'static',
  integrations: [react(), mdx({ processor: satteri() })],
  vite: {
    // Albums hydrate on visibility, so prebundle their animation dependency
    // before the first island appears instead of re-optimizing mid-page.
    optimizeDeps: { include: ['motion/react'] },
    server: {
      // Allow tunnelled dev access (e.g. sahaje.beta.localcan.dev).
      allowedHosts: ['.localcan.dev'],
    },
  },
});
