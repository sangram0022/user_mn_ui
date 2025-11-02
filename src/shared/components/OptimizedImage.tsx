/**
 * OptimizedImage Component
 * 
 * Features:
 * - Lazy loading (loading="lazy")
 * - Responsive srcset for different screen sizes
 * - Aspect ratio maintenance (prevents CLS)
 * - Priority loading for above-the-fold images
 * - Configurable image quality
 * 
 * Usage:
 * 
 * // Basic usage
 * <OptimizedImage
 *   src={imageUrl}
 *   alt="Product"
 *   width={800}
 *   height={600}
 * />
 * 
 * // Priority loading (LCP candidate)
 * <OptimizedImage
 *   src={heroImage}
 *   alt="Hero"
 *   width={1920}
 *   height={1080}
 *   priority
 *   quality={90}
 * />
 * 
 * // With aspect ratio
 * <OptimizedImage
 *   src={thumbnailUrl}
 *   alt="Thumbnail"
 *   width={200}
 *   height={200}
 *   aspectRatio="square"
 * />
 */

import { forwardRef } from 'react';
import type { ImgHTMLAttributes } from 'react';
import {
  generateSrcSet,
  getAspectRatioClass,
  generateImageUrl,
  getImageSizes,
} from '@/shared/utils/imageOptimization';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean; // true = fetchPriority="high", loading="eager"
  quality?: 75 | 80 | 85 | 90;
  aspectRatio?: 'video' | 'square' | '4/3' | '16/9' | '8/5';
  containerClassName?: string;
}

/**
 * High-performance image component with built-in optimizations
 * 
 * Optimizations:
 * - Lazy loading with eager load for priority images
 * - Responsive srcset (320px, 640px, 1280px, and specified width)
 * - Aspect ratio container to prevent CLS
 * - High priority fetch for LCP candidates
 * - Async decoding for non-priority images
 */
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      priority = false,
      quality = 80,
      aspectRatio,
      className = '',
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    // Map aspect ratio prop to Tailwind class
    const aspectRatioMap: Record<string, string> = {
      video: 'aspect-video', // 16:9
      square: 'aspect-square', // 1:1
      '4/3': 'aspect-[4/3]',
      '16/9': 'aspect-[16/9]',
      '8/5': 'aspect-[8/5]',
    };

    const containerClass =
      (aspectRatio ? aspectRatioMap[aspectRatio] : width && height ? getAspectRatioClass(width, height) : 'aspect-auto') ||
      'aspect-auto';

    return (
      <div
        className={`overflow-hidden rounded ${containerClass} ${containerClassName}`}
      >
        <img
          ref={ref}
          src={generateImageUrl(src, width || 1280, quality)}
          srcSet={width ? generateSrcSet(src, [320, 640, 960, width]) : undefined}
          sizes={width ? getImageSizes(width) : '100vw'}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding={priority ? 'sync' : 'async'}
          width={width}
          height={height}
          className={`w-full h-full object-cover ${className}`}
          {...props}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';
