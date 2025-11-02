/**
 * Image Optimization Utility
 * Prevents CLS, enables lazy loading, generates responsive srcsets
 * 
 * Usage:
 * import { OptimizedImage } from '@/shared/components/OptimizedImage';
 * 
 * <OptimizedImage
 *   src={imageUrl}
 *   alt="Product"
 *   width={800}
 *   height={600}
 *   priority={index < 3}
 *   quality={85}
 *   aspectRatio="4/3"
 * />
 */

export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean; // Load immediately (LCP candidate)
  quality?: 75 | 80 | 85 | 90; // Default: 80
}

/**
 * Generates Tailwind-compatible aspect ratio class to prevent CLS
 * @param width Image width in pixels
 * @param height Image height in pixels
 * @returns Tailwind aspect ratio class
 */
export function getAspectRatioClass(width: number, height: number): string {
  const ratio = (height / width) * 100;
  
  // Common ratios
  if (Math.abs(ratio - 66.67) < 0.5) return 'aspect-video'; // 16:9
  if (Math.abs(ratio - 100) < 0.5) return 'aspect-square'; // 1:1
  if (Math.abs(ratio - 75) < 0.5) return 'aspect-[4/3]'; // 4:3
  if (Math.abs(ratio - 56.25) < 0.5) return 'aspect-[16/9]'; // 16:9
  if (Math.abs(ratio - 62.5) < 0.5) return 'aspect-[8/5]'; // 8:5
  
  return 'aspect-auto';
}

/**
 * Generates responsive image srcset for different screen sizes
 * @param src Original image source
 * @param sizes Array of widths to generate (default: [320, 640, 1280])
 * @returns srcset string for img tag
 */
export function generateSrcSet(src: string, sizes: number[] = [320, 640, 1280]): string {
  return sizes
    .map((size) => `${generateImageUrl(src, size)} ${size}w`)
    .join(', ');
}

/**
 * Generates optimized image URL
 * Replace CDN_URL with your image CDN (Cloudinary, Imgix, AWS CloudFront, etc.)
 * 
 * @param src Original image path
 * @param width Desired width in pixels
 * @param quality Compression quality (75-90)
 * @returns Optimized image URL
 */
export function generateImageUrl(
  src: string,
  width: number,
  quality: number = 80
): string {
  // ⚠️ IMPORTANT: Replace with your actual CDN endpoint
  // Examples:
  // Cloudinary: https://res.cloudinary.com/{cloud_name}/image/fetch/w_{width},q_{quality},f_auto/{src}
  // Imgix: https://{domain}.imgix.net/{src}?w={width}&q={quality}&auto=format
  // AWS CloudFront: https://{distribution}.cloudfront.net/{src}?w={width}&q={quality}
  
  const CDN_URL = import.meta.env.VITE_IMAGE_CDN_URL;
  
  if (!CDN_URL) {
    console.warn('VITE_IMAGE_CDN_URL not configured. Using original image URL.');
    return src;
  }
  
  // Generic CDN parameter format (adjust based on your CDN)
  return `${CDN_URL}/${src}?w=${width}&q=${quality}&f=auto`;
}

/**
 * Determines if image should be priority loaded based on position
 * First 3 images are typically above-the-fold
 * 
 * @param index Position in list
 * @returns true if should be priority loaded
 */
export function shouldPriorityLoad(index: number): boolean {
  return index < 3;
}

/**
 * Gets sizes attribute for responsive images
 * Tells browser which image size to use at different breakpoints
 * 
 * @param maxWidth Maximum width of image container
 * @returns sizes attribute string
 */
export function getImageSizes(maxWidth: number): string {
  return [
    '(max-width: 640px) 100vw', // Mobile: full viewport width
    '(max-width: 1024px) 50vw', // Tablet: half viewport
    '(max-width: 1280px) 33vw', // Desktop: third
    `${maxWidth}px`, // Large desktop: fixed width
  ].join(', ');
}

/**
 * Cache busting utility for when image content changes
 * @param src Image source
 * @param version Version hash
 * @returns Image URL with cache bust parameter
 */
export function cacheBustImageUrl(src: string, version: string = ''): string {
  const timestamp = version || Date.now();
  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}v=${timestamp}`;
}
