import type { ImageOptimizationOptions } from './types';

// ========================================
// Image URL Builder
// ========================================

export class ImageURLBuilder {
  private baseURL: string;
  private options: Required<ImageOptimizationOptions>;

  constructor(
    baseURL: string = '', 
    options: ImageOptimizationOptions = {}
  ) {
    this.baseURL = baseURL;
    this.options = {
      quality: 85,
      format: 'auto',
      progressive: true,
      blur: 0,
      devicePixelRatio: [1, 2, 3],
      breakpoints: [640, 768, 1024, 1280, 1536],
      ...options,
    };
  }

  /**
   * Build optimized image URL
   */
  buildURL(
    src: string, 
    width?: number, 
    height?: number,
    format?: string,
    quality?: number
  ): string {
    // For external URLs or if no optimization service, return as-is
    if (src.startsWith('http') || src.startsWith('data:') || !this.baseURL) {
      return src;
    }

    const params = new URLSearchParams();
    
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality || this.options.quality) {
      params.set('q', (quality || this.options.quality).toString());
    }
    if (format !== 'auto' && format) params.set('f', format);
    if (this.options.progressive) params.set('fm', 'progressive');

    const queryString = params.toString();
    const separator = this.baseURL.includes('?') ? '&' : '?';
    
    return `${this.baseURL}${src}${queryString ? separator + queryString : ''}`;
  }

  /**
   * Generate srcset for responsive images (DPR)
   */
  generateSrcSet(
    src: string, 
    baseWidth: number, 
    format?: string
  ): string {
    const srcSet: string[] = [];
    
    for (const dpr of this.options.devicePixelRatio) {
      const width = Math.round(baseWidth * dpr);
      const url = this.buildURL(src, width, undefined, format);
      srcSet.push(`${url} ${dpr}x`);
    }
    
    return srcSet.join(', ');
  }

  /**
   * Generate srcset for different viewport sizes
   */
  generateResponsiveSrcSet(
    src: string, 
    format?: string
  ): string {
    const srcSet: string[] = [];
    
    for (const breakpoint of this.options.breakpoints) {
      const url = this.buildURL(src, breakpoint, undefined, format);
      srcSet.push(`${url} ${breakpoint}w`);
    }
    
    return srcSet.join(', ');
  }

  /**
   * Generate placeholder image URL (low quality, blurred)
   */
  generatePlaceholder(src: string, width = 40, blur = 10): string {
    return this.buildURL(src, width, undefined, 'jpg', 20) + `&blur=${blur}`;
  }
}
