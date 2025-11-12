// ========================================
// Modern Image Components - Compatibility Layer
// ========================================
// This file maintains backward compatibility for imports
// All components are now separated into individual files:
//
// Components:
//   - ProgressiveImage.tsx - Progressive loading with blur-up
//   - ResponsivePicture.tsx - Picture element with format fallbacks
//   - ImageGallery.tsx - Virtual scrolling gallery
//   - OptimizedAvatar.tsx - Avatar with initials fallback
//
// Utilities:
//   - utils/FormatDetector.ts - WebP/AVIF detection
//   - utils/ImageURLBuilder.ts - URL optimization
//   - utils/types.ts - Type definitions
//
// Import from './index' or individual component files directly
// ========================================

// Re-export all components and utilities
export {
  ProgressiveImage,
  ResponsivePicture,
  ImageGallery,
  OptimizedAvatar,
  FormatDetector,
  ImageURLBuilder,
} from './index';

export type {
  ImageSource,
  ResponsiveImageProps,
  ImageOptimizationOptions,
  ResponsivePictureProps,
  ImageGalleryProps,
  OptimizedAvatarProps,
} from './index';
