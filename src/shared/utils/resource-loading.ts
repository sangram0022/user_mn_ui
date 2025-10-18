/**
 * Resource Loading Utilities
 *
 * React 19's built-in asset loading APIs from react-dom
 * Replaces custom DOM manipulation with React's integrated approach
 *
 * Benefits over custom utilities:
 * - Better deduplication (React tracks loaded resources)
 * - SSR support (works with server rendering)
 * - Automatic cleanup
 * - Type safety
 * - Future-proof (aligns with React ecosystem)
 *
 * @see https://react.dev/reference/react-dom#resource-preloading-apis
 */

/**
 * React 19 resource preloading APIs
 * These are available in react-dom but may need experimental flag
 * @see https://react.dev/reference/react-dom#resource-preloading-apis
 */

// Type definitions for React 19 resource loading APIs

type PreloadFunction = (href: string, options?: Record<string, unknown>) => void;

type PrefetchFunction = (href: string, options?: Record<string, unknown>) => void;

type PreinitFunction = (src: string, options: Record<string, unknown>) => void;

// Access React DOM's resource APIs
// In React 19, these are available but might not be in type definitions yet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ReactDOM: any = await import('react-dom');
const preload: PreloadFunction = ReactDOM.preload;
const prefetch: PrefetchFunction = ReactDOM.prefetch;
const preinit: PreinitFunction = ReactDOM.preinit;

/**
 * Preload Types
 */
export type PreloadAs = 'font' | 'image' | 'script' | 'style' | 'fetch';
export type PreloadCrossOrigin = 'anonymous' | 'use-credentials';
export type PreloadFetchPriority = 'high' | 'low' | 'auto';

/**
 * Preload Options
 */
export interface PreloadOptions {
  /**
   * Resource type
   */
  as: PreloadAs;

  /**
   * CORS policy
   */
  crossOrigin?: PreloadCrossOrigin;

  /**
   * Resource integrity hash
   */
  integrity?: string;

  /**
   * MIME type
   */
  type?: string;

  /**
   * Fetch priority hint
   */
  fetchPriority?: PreloadFetchPriority;

  /**
   * Image sizes attribute
   */
  imageSizes?: string;

  /**
   * Image srcset attribute
   */
  imageSrcSet?: string;

  /**
   * Referrer policy
   */
  referrerPolicy?: string;
}

/**
 * Prefetch Options
 */
export interface PrefetchOptions {
  /**
   * Resource type (optional for prefetch)
   */
  as?: 'document' | 'script' | 'style';
}

/**
 * Preinit Script Options
 */
export interface PreinitScriptOptions {
  /**
   * Always 'script' for preinit
   */
  as: 'script';

  /**
   * CORS policy
   */
  crossOrigin?: PreloadCrossOrigin;

  /**
   * Resource integrity hash
   */
  integrity?: string;

  /**
   * Fetch priority hint
   */
  fetchPriority?: PreloadFetchPriority;

  /**
   * Nonce for CSP
   */
  nonce?: string;
}

/**
 * Preinit Style Options
 */
export interface PreinitStyleOptions {
  /**
   * Always 'style' for preinit
   */
  as: 'style';

  /**
   * CORS policy
   */
  crossOrigin?: PreloadCrossOrigin;

  /**
   * Resource integrity hash
   */
  integrity?: string;

  /**
   * Fetch priority hint
   */
  fetchPriority?: PreloadFetchPriority;

  /**
   * Media query
   */
  media?: string;

  /**
   * Precedence for style insertion order
   */
  precedence?: string;
}

/**
 * ✅ React 19: Preload a critical font
 *
 * Preloads fonts to prevent FOUT (Flash of Unstyled Text)
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   preloadFont('/fonts/inter-bold.woff2');
 * }, []);
 * ```
 */
export const preloadFont = (href: string, options?: { crossOrigin?: PreloadCrossOrigin }) => {
  preload(href, {
    as: 'font',
    type: 'font/woff2',
    crossOrigin: options?.crossOrigin || 'anonymous',
  });
};

/**
 * ✅ React 19: Preload a critical image
 *
 * Preloads images for hero sections or above-the-fold content
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   preloadImage('/images/hero.jpg', { fetchPriority: 'high' });
 * }, []);
 * ```
 */
export const preloadImage = (
  href: string,
  options?: {
    fetchPriority?: PreloadFetchPriority;
    imageSizes?: string;
    imageSrcSet?: string;
  }
) => {
  preload(href, {
    as: 'image',
    fetchPriority: options?.fetchPriority,
    imageSizes: options?.imageSizes,
    imageSrcSet: options?.imageSrcSet,
  });
};

/**
 * ✅ React 19: Preload a stylesheet
 *
 * Preloads CSS files for faster paint
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   preloadStylesheet('/styles/critical.css');
 * }, []);
 * ```
 */
export const preloadStylesheet = (href: string, options?: { integrity?: string }) => {
  preload(href, {
    as: 'style',
    integrity: options?.integrity,
  });
};

/**
 * ✅ React 19: Preload a script
 *
 * Preloads JavaScript files for faster execution
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   preloadScript('/scripts/analytics.js', { fetchPriority: 'low' });
 * }, []);
 * ```
 */
export const preloadScript = (
  href: string,
  options?: { integrity?: string; fetchPriority?: PreloadFetchPriority }
) => {
  preload(href, {
    as: 'script',
    integrity: options?.integrity,
    fetchPriority: options?.fetchPriority,
  });
};

/**
 * ✅ React 19: Preload data/fetch
 *
 * Preloads API responses or JSON data
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   preloadData('/api/users');
 * }, []);
 * ```
 */
export const preloadData = (href: string, options?: { crossOrigin?: PreloadCrossOrigin }) => {
  preload(href, {
    as: 'fetch',
    crossOrigin: options?.crossOrigin || 'anonymous',
  });
};

/**
 * ✅ React 19: Prefetch a route/document
 *
 * Prefetches pages for future navigation
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   prefetchRoute('/users'); // Prefetch for faster navigation
 * }, []);
 * ```
 */
export const prefetchRoute = (href: string) => {
  prefetch(href, { as: 'document' });
};

/**
 * ✅ React 19: Prefetch a script
 *
 * Prefetches JavaScript for future use
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   prefetchScript('/scripts/chart.js'); // Load when idle
 * }, []);
 * ```
 */
export const prefetchScript = (href: string) => {
  prefetch(href, { as: 'script' });
};

/**
 * ✅ React 19: Preinit and execute a script
 *
 * Loads and executes a script immediately
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   preinitScript('/scripts/analytics.js');
 * }, []);
 * ```
 */
export const preinitScript = (src: string, options?: Omit<PreinitScriptOptions, 'as'>) => {
  preinit(src, {
    as: 'script',
    ...options,
  });
};

/**
 * ✅ React 19: Preinit a stylesheet
 *
 * Loads and applies a stylesheet immediately
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   preinitStylesheet('/styles/theme-dark.css', { precedence: 'theme' });
 * }, []);
 * ```
 */
export const preinitStylesheet = (href: string, options?: Omit<PreinitStyleOptions, 'as'>) => {
  preinit(href, {
    as: 'style',
    ...options,
  });
};

/**
 * ✅ React 19: Preload multiple fonts at once
 *
 * Batch preload fonts for better performance
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   preloadFonts([
 *     '/fonts/inter-regular.woff2',
 *     '/fonts/inter-bold.woff2',
 *   ]);
 * }, []);
 * ```
 */
export const preloadFonts = (fonts: string[]) => {
  fonts.forEach((font) => preloadFont(font));
};

/**
 * ✅ React 19: Preload critical resources
 *
 * Preloads essential resources for initial page load
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   preloadCriticalResources({
 *     fonts: ['/fonts/inter.woff2'],
 *     images: ['/images/logo.svg'],
 *     styles: ['/styles/critical.css'],
 *   });
 * }, []);
 * ```
 */
export const preloadCriticalResources = (resources: {
  fonts?: string[];
  images?: string[];
  styles?: string[];
  scripts?: string[];
  data?: string[];
}) => {
  resources.fonts?.forEach((font) => preloadFont(font));
  resources.images?.forEach((image) => preloadImage(image, { fetchPriority: 'high' }));
  resources.styles?.forEach((style) => preloadStylesheet(style));
  resources.scripts?.forEach((script) => preloadScript(script, { fetchPriority: 'high' }));
  resources.data?.forEach((url) => preloadData(url));
};

/**
 * ✅ React 19: Preconnect to external origins
 *
 * Note: React doesn't have built-in preconnect, but we can use DNS prefetch
 * For full preconnect, use <link rel="preconnect"> in HTML head
 *
 * @example
 * ```tsx
 * // In your component
 * <>
 *   <link rel="preconnect" href="https://fonts.googleapis.com" />
 *   <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
 * </>
 * ```
 */
export const preconnectOrigin = (origin: string) =>
  // React 19 doesn't have preconnect API, use declarative approach in your component:
  // <link rel="preconnect" href={origin} />
  origin; // Return for potential logging

/**
 * Resource loading hooks for React components
 */

/**
 * Hook to preload resources on component mount
 *
 * @example
 * ```tsx
 * const MyPage = () => {
 *   usePreloadResources({
 *     fonts: ['/fonts/inter.woff2'],
 *     images: ['/images/hero.jpg'],
 *   });
 *
 *   return <div>Page content</div>;
 * };
 * ```
 */
export const usePreloadResources = (resources: Parameters<typeof preloadCriticalResources>[0]) => {
  // React 19: No useEffect needed for preload
  // Preload happens during render
  preloadCriticalResources(resources);
};

/**
 * Hook to prefetch routes on hover
 *
 * @example
 * ```tsx
 * const NavLink = ({ to }: { to: string }) => {
 *   const prefetch = usePrefetchRoute();
 *
 *   return (
 *     <a
 *       href={to}
 *       onMouseEnter={() => prefetch(to)}
 *     >
 *       Link
 *     </a>
 *   );
 * };
 * ```
 */
export const usePrefetchRoute = () => (href: string) => {
  prefetchRoute(href);
};

/**
 * Migration helper: Log differences between old and new API
 */
export const migrationGuide = {
  before: {
    example: `
      // ❌ Old way (custom DOM manipulation)
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = '/fonts/inter.woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    `,
  },
  after: {
    example: `
      // ✅ React 19 way (built-in API)
      import { preloadFont } from '@/shared/utils/resource-loading';
      
      useEffect(() => {
        preloadFont('/fonts/inter.woff2');
      }, []);
    `,
  },
};
