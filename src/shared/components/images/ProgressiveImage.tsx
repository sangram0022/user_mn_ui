import { useState, useEffect, useMemo } from 'react';
import { useImageLoading } from '@/shared/hooks/useImageLoading';
import { FormatDetector, ImageURLBuilder } from './utils';
import type { ResponsiveImageProps } from './utils/types';

// ========================================
// Progressive Image Component
// ========================================

export function ProgressiveImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  style,
  loading = 'lazy',
  priority = false,
}: ResponsiveImageProps) {
  const [bestFormat, setBestFormat] = useState<string>('jpg');
  const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null);
  
  const isLazy = loading === 'lazy' && !priority;
  
  const {
    isLoaded,
    isLoading,
    error,
    currentSrc,
    shouldLoad,
    imgRef,
  } = useImageLoading(src as string, { lazy: isLazy });

  // Kept: useMemo prevents object recreation, required for useEffect dependency
  const imageBuilder = useMemo(() => new ImageURLBuilder(), []);

  // Detect best format on mount
  useEffect(() => {
    FormatDetector.getBestFormat().then((format: string) => {
      setBestFormat(format);
    });
  }, []);

  // Generate placeholder
  useEffect(() => {
    if (placeholder === 'blur' && typeof src === 'string') {
      const placeholderUrl = blurDataURL || imageBuilder.generatePlaceholder(src);
      setPlaceholderSrc(placeholderUrl);
    }
  }, [src, placeholder, blurDataURL, imageBuilder]);

  // Handle load/error events
  useEffect(() => {
    if (isLoaded && onLoad) {
      onLoad();
    }
  }, [isLoaded, onLoad]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  // Build optimized src
  const optimizedSrc = typeof src === 'string' 
    ? imageBuilder.buildURL(src, width, height, bestFormat)
    : src[0]?.src || '';

  // Generate srcSet for responsive images
  const srcSet = width && typeof src === 'string'
    ? imageBuilder.generateSrcSet(src, width, bestFormat)
    : '';

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height, ...style }}
    >
      {/* Placeholder */}
      {placeholder !== 'empty' && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          {placeholder === 'blur' && placeholderSrc ? (
            <img
              src={placeholderSrc}
              alt=""
              className="w-full h-full object-cover filter blur-sm scale-110"
              style={{ filter: 'blur(10px)' }}
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent" />
        </div>
      )}

      {/* Main image */}
      {shouldLoad && (
        <img
          ref={imgRef}
          src={currentSrc || optimizedSrc}
          srcSet={srcSet}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          className={`
            w-full h-full object-cover transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${error ? 'hidden' : ''}
          `}
          onLoad={() => {
            // Additional load handling if needed
          }}
          onError={() => {
            // Image load errors are handled by error state
          }}
        />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div>Image failed to load</div>
          </div>
        </div>
      )}
    </div>
  );
}
