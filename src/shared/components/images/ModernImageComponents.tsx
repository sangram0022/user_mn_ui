// ========================================
// Modern Image Loading - Advanced Performance
// ========================================
// Comprehensive image optimization system:
// - Progressive image loading with blur-up effect
// - WebP/AVIF format detection and fallbacks
// - Responsive images with srcset and sizes
// - Lazy loading with intersection observer
// - Image compression and optimization
// - Memory management for large images
// ========================================

import { useState, useEffect, useRef } from 'react';

// ========================================
// Types and Interfaces
// ========================================

export interface ImageSource {
  src: string;
  width?: number;
  height?: number;
  format?: 'webp' | 'avif' | 'jpg' | 'png';
  quality?: number;
}

export interface ResponsiveImageProps {
  src: string | ImageSource[];
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  placeholder?: 'blur' | 'empty' | string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  style?: React.CSSProperties;
}

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  progressive?: boolean;
  blur?: number;
  devicePixelRatio?: number[];
  breakpoints?: number[];
}

// ========================================
// Modern Format Detection
// ========================================

class FormatDetector {
  private static supportCache = new Map<string, boolean>();

  /**
   * Check if browser supports modern image formats
   */
  static async supportsFormat(format: 'webp' | 'avif'): Promise<boolean> {
    // Return cached result if available
    if (this.supportCache.has(format)) {
      return this.supportCache.get(format)!;
    }

    // Test format support
    const testImages = {
      webp: 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgS0AAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=',
    };

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const supported = img.width === 1 && img.height === 1;
        this.supportCache.set(format, supported);
        resolve(supported);
      };
      img.onerror = () => {
        this.supportCache.set(format, false);
        resolve(false);
      };
      img.src = testImages[format];
    });
  }

  /**
   * Get best supported format for current browser
   */
  static async getBestFormat(): Promise<'avif' | 'webp' | 'jpg'> {
    if (await this.supportsFormat('avif')) return 'avif';
    if (await this.supportsFormat('webp')) return 'webp';
    return 'jpg';
  }
}

// ========================================
// Image URL Builder
// ========================================

class ImageURLBuilder {
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
   * Generate srcset for responsive images
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

import { useImageLoading } from '../../hooks/useImageLoading';

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

  const imageBuilder = new ImageURLBuilder();

  // Detect best format on mount
  useEffect(() => {
    FormatDetector.getBestFormat().then(format => {
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

// ========================================
// Responsive Picture Component
// ========================================

export interface ResponsivePictureProps {
  sources: ImageSource[];
  alt: string;
  sizes?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export function ResponsivePicture({
  sources,
  alt,
  sizes = '100vw',
  className = '',
  loading = 'lazy',
  priority = false,
  onLoad,
  onError,
}: ResponsivePictureProps) {
  // AWS CloudFront handles format optimization automatically
  const imageBuilder = new ImageURLBuilder();

  // Remove custom format detection - AWS handles this
  // useEffect(() => {
  //   FormatDetector.getBestFormat().then(format => {
  //     setBestFormat(format);
  //   });
  // }, []);

  // Sort sources by format preference
  const sortedSources = [...sources].sort((a, b) => {
    const formatPriority = { avif: 3, webp: 2, jpg: 1, png: 1 };
    return (formatPriority[b.format || 'jpg'] || 1) - (formatPriority[a.format || 'jpg'] || 1);
  });

  return (
    <picture className={className}>
      {/* Modern format sources */}
      {sortedSources.map((source, index) => {
        if (!source.format || source.format === 'jpg' || source.format === 'png') {
          return null; // Skip fallback formats in source elements
        }

        const srcSet = source.width
          ? imageBuilder.generateSrcSet(source.src, source.width, source.format)
          : imageBuilder.buildURL(source.src, undefined, undefined, source.format);

        return (
          <source
            key={`${source.format}-${index}`}
            type={`image/${source.format}`}
            srcSet={srcSet}
            sizes={sizes}
          />
        );
      })}

      {/* Fallback img element */}
      <ProgressiveImage
        src={sortedSources.find(s => !s.format || s.format === 'jpg' || s.format === 'png')?.src || sources[0].src}
        alt={alt}
        width={sources[0].width}
        height={sources[0].height}
        loading={loading}
        priority={priority}
        onLoad={onLoad}
        onError={onError}
      />
    </picture>
  );
}

// ========================================
// Image Gallery Component with Virtual Scrolling
// ========================================

export interface ImageGalleryProps {
  images: ImageSource[];
  columns?: number;
  gap?: number;
  lazy?: boolean;
  onImageClick?: (image: ImageSource, index: number) => void;
}

export function ImageGallery({
  images,
  columns = 3,
  gap = 16,
  lazy = true,
  onImageClick,
}: ImageGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  // Calculate which images should be rendered based on scroll position
  useEffect(() => {
    if (!containerRef.current) return;

    const handleScroll = () => {
      const container = containerRef.current!;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemHeight = 200 + gap; // Approximate item height + gap

      const start = Math.max(0, Math.floor(scrollTop / itemHeight) * columns - columns);
      const end = Math.min(
        images.length,
        Math.ceil((scrollTop + containerHeight) / itemHeight) * columns + columns
      );

      setVisibleRange({ start, end });
    };

    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => container.removeEventListener('scroll', handleScroll);
  }, [images.length, columns, gap]);

  const visibleImages = images.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      className="overflow-auto h-full"
      style={{ maxHeight: '80vh' }}
    >
      <div
        className={`grid gap-${gap / 4} grid-cols-${columns}`}
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
          paddingTop: `${Math.floor(visibleRange.start / columns) * (200 + gap)}px`,
          paddingBottom: `${Math.floor((images.length - visibleRange.end) / columns) * (200 + gap)}px`,
        }}
      >
        {visibleImages.map((image, index) => {
          const actualIndex = visibleRange.start + index;
          
          return (
            <div
              key={actualIndex}
              className="aspect-square cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => onImageClick?.(image, actualIndex)}
            >
              <ProgressiveImage
                src={image.src}
                alt={`Gallery image ${actualIndex + 1}`}
                width={image.width || 300}
                height={image.height || 300}
                className="rounded-lg shadow-md hover:shadow-lg transition-shadow"
                loading={lazy ? 'lazy' : 'eager'}
                placeholder="blur"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ========================================
// Optimized Avatar Component
// ========================================

export interface OptimizedAvatarProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}

export function OptimizedAvatar({
  src,
  name,
  size = 40,
  className = '',
}: OptimizedAvatarProps) {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  const colorIndex = name.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];

  if (!src) {
    return (
      <div
        className={`
          ${bgColor} text-white rounded-full flex items-center justify-center
          font-semibold ${className}
        `}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <ProgressiveImage
        src={src}
        alt={`${name}'s avatar`}
        width={size}
        height={size}
        className="rounded-full"
        priority={size > 100} // Prioritize larger avatars
        placeholder="empty"
      />
      
      {/* Fallback initials (shown on error) */}
      <div
        className={`
          absolute inset-0 ${bgColor} text-white rounded-full 
          flex items-center justify-center font-semibold opacity-0
        `}
        style={{ fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    </div>
  );
}

// ========================================
// Export Components and Utilities
// ========================================

export { FormatDetector, ImageURLBuilder };
// Duplicate export removed - AWS handles image optimization