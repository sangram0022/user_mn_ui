// ========================================
// Image Optimization Demo - Usage Examples
// ========================================
// Demonstrates modern image loading patterns with:
// - Progressive loading with blur-up effect
// - Responsive images with format detection
// - Virtual scrolling gallery
// - Optimized avatars
// ========================================

import { useState } from 'react';
import { 
  ProgressiveImage, 
  ResponsivePicture, 
  ImageGallery, 
  OptimizedAvatar,
  type ImageSource 
} from './ModernImageComponents';

// ========================================
// Demo Component
// ========================================

export function ImageOptimizationDemo() {
  const [selectedImage, setSelectedImage] = useState<ImageSource | null>(null);

  // Sample images for gallery
  const galleryImages: ImageSource[] = [
    { src: '/images/gallery/image1.jpg', width: 400, height: 300 },
    { src: '/images/gallery/image2.jpg', width: 400, height: 300 },
    { src: '/images/gallery/image3.jpg', width: 400, height: 300 },
    // ... more images
  ];

  // Sample responsive image sources
  const responsiveSources: ImageSource[] = [
    { src: '/images/hero/large.avif', format: 'avif', width: 1200, height: 600 },
    { src: '/images/hero/large.webp', format: 'webp', width: 1200, height: 600 },
    { src: '/images/hero/large.jpg', format: 'jpg', width: 1200, height: 600 },
  ];

  return (
    <div className="space-y-12 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Modern Image Optimization Demo</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Showcasing progressive loading, modern formats (WebP/AVIF), responsive images, 
          and performance-optimized components.
        </p>
      </div>

      {/* Progressive Image Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Progressive Image Loading</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProgressiveImage
            src="/images/demo/landscape.jpg"
            alt="Beautiful landscape with progressive loading"
            width={500}
            height={300}
            className="rounded-lg shadow-lg"
            placeholder="blur"
            priority={false}
          />
          <ProgressiveImage
            src="/images/demo/portrait.jpg"
            alt="Portrait with instant loading"
            width={500}
            height={300}
            className="rounded-lg shadow-lg"
            placeholder="blur"
            priority={true}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Left: Lazy loaded with blur placeholder. Right: Priority loaded for above-fold content.
        </p>
      </section>

      {/* Responsive Picture Example */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Responsive Picture with Modern Formats</h2>
        <ResponsivePicture
          sources={responsiveSources}
          alt="Responsive hero image with AVIF/WebP/JPG fallbacks"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          className="w-full max-w-4xl mx-auto rounded-xl shadow-lg"
        />
        <p className="text-sm text-gray-500 mt-2 text-center">
          Automatically serves AVIF → WebP → JPG based on browser support. 
          Responsive breakpoints optimize bandwidth usage.
        </p>
      </section>

      {/* Avatar Gallery */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Optimized Avatars</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <OptimizedAvatar
            src="/images/avatars/user1.jpg"
            name="John Doe"
            size={60}
          />
          <OptimizedAvatar
            name="Jane Smith"
            size={60}
          />
          <OptimizedAvatar
            src="/images/avatars/user3.jpg"
            name="Bob Johnson"
            size={80}
          />
          <OptimizedAvatar
            name="Alice Brown"
            size={40}
          />
          <OptimizedAvatar
            name="Charlie Wilson"
            size={100}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Avatars with automatic fallback to initials. Optimized loading and caching.
        </p>
      </section>

      {/* Virtual Scrolling Gallery */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Virtual Scrolling Gallery</h2>
        <div className="border rounded-lg overflow-hidden">
          <ImageGallery
            images={galleryImages}
            columns={4}
            gap={16}
            lazy={true}
            onImageClick={(image, _index) => {
              setSelectedImage(image);
            }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Handles thousands of images efficiently with virtual scrolling and lazy loading.
        </p>
      </section>

      {/* Performance Metrics */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Performance Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Format Optimization</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• AVIF: 50% smaller than WebP</li>
              <li>• WebP: 25-35% smaller than JPEG</li>
              <li>• Automatic format detection</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Loading Performance</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Progressive enhancement</li>
              <li>• Intersection observer lazy loading</li>
              <li>• Blur-up placeholder effect</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Memory Management</h3>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Virtual scrolling for galleries</li>
              <li>• Automatic cleanup</li>
              <li>• Optimized caching strategies</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full p-4">
            <ProgressiveImage
              src={selectedImage.src}
              alt="Selected gallery image"
              width={selectedImage.width}
              height={selectedImage.height}
              className="max-w-full max-h-full object-contain"
              priority={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageOptimizationDemo;