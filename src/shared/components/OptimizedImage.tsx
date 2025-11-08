/**
 * Simple Image Component for AWS CloudFront
 * AWS CloudFront automatically handles:
 * - Image format optimization (WebP/AVIF)
 * - Compression and quality optimization
 * - Responsive image delivery
 * - CDN caching and edge optimization
 */

import { forwardRef } from 'react';
import type { ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  aspectRatio?: 'video' | 'square' | '4/3' | '16/9' | '8/5';
  containerClassName?: string;
}

const aspectRatioMap = {
  video: 'aspect-video',
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-video',
  '8/5': 'aspect-[8/5]',
} as const;

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      priority = false,
      aspectRatio,
      containerClassName = '',
      className = '',
      ...props
    },
    ref
  ) => {
    const loading = priority ? 'eager' : 'lazy';
    const fetchPriority = priority ? 'high' : 'auto';
    const aspectRatioClass = aspectRatio ? aspectRatioMap[aspectRatio] : '';

    return (
      <div className={`${aspectRatioClass} ${containerClassName}`.trim()}>
        <img
          ref={ref}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          fetchPriority={fetchPriority as 'high' | 'auto'}
          decoding="async"
          className={`w-full h-full object-cover ${className}`.trim()}
          {...props}
        />
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';
