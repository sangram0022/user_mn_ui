// ========================================
// Modern Image Components
// ========================================
// Barrel export for all image-related components and utilities

// Core components
export { ProgressiveImage } from './ProgressiveImage';
export { ResponsivePicture } from './ResponsivePicture';
export { ImageGallery } from './ImageGallery';
export { OptimizedAvatar } from './OptimizedAvatar';

// Utilities and types
export { FormatDetector, ImageURLBuilder } from './utils';
export type {
  ImageSource,
  ResponsiveImageProps,
  ImageOptimizationOptions,
  ResponsivePictureProps,
  ImageGalleryProps,
  OptimizedAvatarProps,
} from './utils/types';
