// ========================================
// Image Component Types
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

export interface ImageGalleryProps {
  images: ImageSource[];
  columns?: number;
  gap?: number;
  lazy?: boolean;
  onImageClick?: (image: ImageSource, index: number) => void;
}

export interface OptimizedAvatarProps {
  src?: string;
  name: string;
  size?: number;
  className?: string;
}
