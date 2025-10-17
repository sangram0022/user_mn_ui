/**
 * Vite Plugin: CSP HTML Transform
 *
 * Transforms index.html to inject production-ready Content-Security-Policy.
 * In production, this removes unsafe-inline and unsafe-eval, implementing
 * nonce-based CSP for enhanced security.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 */

import crypto from 'node:crypto';
import type { Plugin } from 'vite';

export interface CSPConfig {
  /**
   * Generate nonces for inline scripts and styles
   */
  enableNonces?: boolean;

  /**
   * Additional script-src directives
   */
  scriptSrc?: string[];

  /**
   * Additional style-src directives
   */
  styleSrc?: string[];

  /**
   * API endpoints for connect-src
   */
  apiEndpoints?: string[];
}

/**
 * Creates a secure CSP string for production
 */
function createProductionCSP(config: CSPConfig, nonce?: string): string {
  const directives: Record<string, string[]> = {
    'default-src': ["'self'"],
    'script-src': ["'self'", ...(config.scriptSrc || [])],
    'style-src': ["'self'", 'https://fonts.googleapis.com', ...(config.styleSrc || [])],
    'font-src': ["'self'", 'https://fonts.gstatic.com'],
    'img-src': ["'self'", 'data:', 'https:', 'blob:'],
    'connect-src': ["'self'", ...(config.apiEndpoints || [])],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  };

  // Add nonce if enabled
  if (config.enableNonces && nonce) {
    directives['script-src'].push(`'nonce-${nonce}'`);
    directives['style-src'].push(`'nonce-${nonce}'`);
  }

  // Join directives
  return (
    Object.entries(directives)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ') + '; upgrade-insecure-requests;'
  );
}

/**
 * Vite plugin to transform CSP in HTML
 */
export function cspHtmlTransform(config: CSPConfig = {}): Plugin {
  let nonce: string | undefined;

  return {
    name: 'csp-html-transform',
    enforce: 'post',

    configResolved(resolvedConfig) {
      // Only generate nonce in production
      if (resolvedConfig.mode === 'production' && config.enableNonces) {
        nonce = crypto.randomBytes(16).toString('base64');
      }
    },

    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        // Only transform in production builds
        if (ctx.bundle) {
          // Generate production CSP
          const cspContent = createProductionCSP(config, nonce);

          // Replace development CSP with production CSP
          html = html.replace(
            /<meta\s+http-equiv="Content-Security-Policy"\s+content="[^"]*"\s*\/>/i,
            `<meta http-equiv="Content-Security-Policy" content="${cspContent}" />`
          );

          // Add nonce to inline scripts and styles if enabled
          if (config.enableNonces && nonce) {
            // Add nonce to script tags
            html = html.replace(/<script(?![^>]*\bsrc=)/gi, `<script nonce="${nonce}"`);

            // Add nonce to style tags
            html = html.replace(/<style/gi, `<style nonce="${nonce}"`);
          }
        }

        return html;
      },
    },
  };
}

/**
 * Example usage in vite.config.ts:
 *
 * import { cspHtmlTransform } from './vite-plugins/csp-html-transform';
 *
 * export default defineConfig({
 *   plugins: [
 *     react(),
 *     cspHtmlTransform({
 *       enableNonces: true,
 *       apiEndpoints: [
 *         'https://*.execute-api.us-east-1.amazonaws.com',
 *       ],
 *     }),
 *   ],
 * });
 */
