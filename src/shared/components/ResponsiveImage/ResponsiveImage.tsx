import type { CSSProperties, ImgHTMLAttributes } from 'react';
import { useState } from 'react';

/**
 * Props for ResponsiveImage component
 */
export interface ResponsiveImageProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  /** Base image source (fallback) */
  src: string;
  /** Alt text for accessibility (required) */
  alt: string;
  /** Array of image sources with widths for srcSet */
  srcSet?: Array<{
    src: string;
    width: number;
  }>;
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** AVIF format source (modern, high compression) */
  avifSrc?: string;
  /** WebP format source (modern, good compression) */
  webpSrc?: string;
  /** Loading strategy: 'lazy' (default), 'eager', or 'auto' */
  loading?: 'lazy' | 'eager';
  /** Decode strategy: 'async' (default), 'sync', or 'auto' */
  decoding?: 'async' | 'sync' | 'auto';
  /** Aspect ratio to maintain while loading (e.g., '16/9', '4/3', '1/1') */
  aspectRatio?: string;
  /** Placeholder strategy */
  placeholder?: 'blur' | 'empty' | 'skeleton';
  /** Blur data URL for blur placeholder */
  blurDataURL?: string;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
  /** Custom CSS class name */
  className?: string;
  /** Object-fit CSS property */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /** Object-position CSS property */
  objectPosition?: string;
  /** Priority loading (disables lazy loading for above-the-fold images) */
  priority?: boolean;
}

/**
 * Responsive Image Component with modern format support
 *
 * Supports AVIF, WebP fallbacks, lazy loading, aspect ratio preservation,
 * and placeholders. Follows React 19 best practices for performance.
 *
 * @example
 * ```tsx
 * // Basic usage with lazy loading
 * <ResponsiveImage
 *   src="/images/user-avatar.jpg"
 *   alt="User profile photo"
 *   className="w-32 h-32 rounded-full"
 * />
 *
 * // Responsive with srcSet
 * <ResponsiveImage
 *   src="/images/banner.jpg"
 *   srcSet={[
 *     { src: '/images/banner-400w.jpg', width: 400 },
 *     { src: '/images/banner-800w.jpg', width: 800 },
 *     { src: '/images/banner-1200w.jpg', width: 1200 },
 *   ]}
 *   sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
 *   alt="Banner image"
 * />
 *
 * // Modern formats with fallback
 * <ResponsiveImage
 *   src="/images/hero.jpg"
 *   avifSrc="/images/hero.avif"
 *   webpSrc="/images/hero.webp"
 *   alt="Hero image"
 *   aspectRatio="16/9"
 * />
 *
 * // Priority loading (above the fold)
 * <ResponsiveImage
 *   src="/images/logo.png"
 *   alt="Company logo"
 *   priority
 *   loading="eager"
 * />
 * ```
 */
export function ResponsiveImage({
  src,
  alt,
  srcSet,
  sizes,
  avifSrc,
  webpSrc,
  loading = 'lazy',
  decoding = 'async',
  aspectRatio,
  placeholder = 'empty',
  blurDataURL,
  onLoad: onLoadCallback,
  onError: onErrorCallback,
  className = '',
  objectFit = 'cover',
  objectPosition = 'center',
  priority = false,
  ...restProps
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Priority images should not be lazy loaded
  const finalLoading = priority ? 'eager' : loading;

  // Build srcSet string from array
  const srcSetString = srcSet
    ? srcSet.map(({ src, width }) => `${src} ${width}w`).join(', ')
    : undefined;

  // Inline styles for aspect ratio and object-fit
  const imageStyles: CSSProperties = {
    aspectRatio: aspectRatio || undefined,
    objectFit,
    objectPosition,
  };

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoadCallback?.();
  };

  // Handle image error
  const handleError = () => {
    setHasError(true);
    onErrorCallback?.();
  };

  // Show skeleton placeholder while loading
  if (!isLoaded && placeholder === 'skeleton') {
    return (
      <div
        className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${className}`}
        style={{
          aspectRatio: aspectRatio || undefined,
        }}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  // Show error fallback
  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}
        style={{
          aspectRatio: aspectRatio || undefined,
        }}
        role="img"
        aria-label={alt}
      >
        <svg
          className="h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  // Use <picture> element for modern format support
  if (avifSrc || webpSrc) {
    return (
      <picture>
        {/* AVIF source (best compression, modern browsers) */}
        {avifSrc && <source srcSet={avifSrc} type="image/avif" sizes={sizes} />}

        {/* WebP source (good compression, wide support) */}
        {webpSrc && <source srcSet={webpSrc} type="image/webp" sizes={sizes} />}

        {/* Fallback image (JPEG/PNG) */}
        <img
          src={src}
          srcSet={srcSetString}
          sizes={sizes}
          alt={alt}
          loading={finalLoading}
          decoding={decoding}
          onLoad={handleLoad}
          onError={handleError}
          className={`${className} ${!isLoaded && placeholder === 'blur' ? 'blur-sm' : ''}`}
          style={{
            ...imageStyles,
            ...(placeholder === 'blur' && blurDataURL && !isLoaded
              ? { backgroundImage: `url(${blurDataURL})`, backgroundSize: 'cover' }
              : {}),
          }}
          {...restProps}
        />
      </picture>
    );
  }

  // Simple <img> element without modern formats
  return (
    <img
      src={src}
      srcSet={srcSetString}
      sizes={sizes}
      alt={alt}
      loading={finalLoading}
      decoding={decoding}
      onLoad={handleLoad}
      onError={handleError}
      className={`${className} ${!isLoaded && placeholder === 'blur' ? 'blur-sm' : ''}`}
      style={{
        ...imageStyles,
        ...(placeholder === 'blur' && blurDataURL && !isLoaded
          ? { backgroundImage: `url(${blurDataURL})`, backgroundSize: 'cover' }
          : {}),
      }}
      {...restProps}
    />
  );
}

/**
 * Avatar Image Component (circular profile image)
 */
export interface AvatarImageProps extends Omit<ResponsiveImageProps, 'aspectRatio' | 'objectFit'> {
  /** Size of avatar: 'sm', 'md', 'lg', or custom className */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether to show online status indicator */
  showOnline?: boolean;
}

export function AvatarImage({
  size = 'md',
  showOnline,
  className = '',
  ...restProps
}: AvatarImageProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  return (
    <div className={`relative inline-block ${sizeClasses[size]}`}>
      <ResponsiveImage
        {...restProps}
        className={`rounded-full object-cover ${className}`}
        aspectRatio="1/1"
        objectFit="cover"
      />
      {showOnline && (
        <span
          className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-gray-800"
          aria-label="Online"
        />
      )}
    </div>
  );
}

/**
 * Logo Image Component (optimized for logos with transparent backgrounds)
 */
export interface LogoImageProps extends Omit<ResponsiveImageProps, 'objectFit'> {
  /** Light mode logo source */
  lightSrc: string;
  /** Dark mode logo source */
  darkSrc?: string;
}

export function LogoImage({
  lightSrc,
  darkSrc,
  alt,
  className = '',
  ...restProps
}: LogoImageProps) {
  // Extract and discard src from restProps to avoid prop conflicts
  const { src: _unused, ...restPropsWithoutSrc } = restProps as typeof restProps & { src?: string };
  void _unused; // Suppress unused variable warning

  return (
    <>
      {/* Light mode logo */}
      <ResponsiveImage
        src={lightSrc}
        alt={alt}
        className={`block dark:hidden ${className}`}
        objectFit="contain"
        {...restPropsWithoutSrc}
      />

      {/* Dark mode logo (if provided) */}
      {darkSrc && (
        <ResponsiveImage
          src={darkSrc}
          alt={alt}
          className={`hidden dark:block ${className}`}
          objectFit="contain"
          {...restPropsWithoutSrc}
        />
      )}
    </>
  );
}
