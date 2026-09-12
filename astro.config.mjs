// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { satteri } from '@astrojs/markdown-satteri';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx({ processor: satteri() })],
  vite: {
    server: {
      // Allow tunnelled dev access (e.g. sahaje.beta.localcan.dev).
      allowedHosts: ['.localcan.dev'],
    },
  },
});
