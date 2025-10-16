/**
 * Vite Plugin: Inline Critical CSS
 *
 * Inlines critical above-the-fold CSS in <head> for faster FCP.
 * Non-critical CSS is loaded asynchronously.
 */

import fs from 'fs';
import path from 'path';
import type { Plugin } from 'vite';

export function inlineCriticalCSS(): Plugin {
  let criticalCSS = '';

  return {
    name: 'vite-plugin-inline-critical-css',
    apply: 'build',

    // Load critical CSS during build
    buildStart() {
      try {
        const criticalPath = path.resolve(__dirname, '../src/styles/critical.css');
        criticalCSS = fs.readFileSync(criticalPath, 'utf-8');

        // Minify critical CSS (basic)
        criticalCSS = criticalCSS
          .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
          .replace(/\n\s+/g, '\n') // Remove extra whitespace
          .replace(/\n{2,}/g, '\n') // Remove multiple newlines
          .trim();

        console.log(`✅ Critical CSS loaded: ${(criticalCSS.length / 1024).toFixed(2)}KB`);
      } catch {
        console.warn('⚠️  Critical CSS not found, skipping inline');
      }
    },

    // Inject critical CSS into HTML
    transformIndexHtml: {
      enforce: 'post',
      transform(html) {
        if (!criticalCSS) return html;

        // Find </head> and inject critical CSS before it
        const criticalStyleTag = `
  <!-- Critical CSS (inlined for faster FCP) -->
  <style id="critical-css">${criticalCSS}</style>
</head>`;

        html = html.replace('</head>', criticalStyleTag);

        // Make non-critical CSS load asynchronously
        html = html.replace(
          /<link\s+rel="stylesheet"\s+crossorigin\s+href="([^"]+\.css)"/g,
          (match, href) => {
            return `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link rel="stylesheet" href="${href}"></noscript>`;
          }
        );

        return html;
      },
    },
  };
}
