import { useRef, useState, useEffect } from 'react';
import { ProgressiveImage } from './ProgressiveImage';
import type { ImageGalleryProps } from './utils/types';

// ========================================
// Image Gallery Component with Virtual Scrolling
// ========================================

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
