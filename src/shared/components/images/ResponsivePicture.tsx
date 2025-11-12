import { ImageURLBuilder } from './utils';
import { ProgressiveImage } from './ProgressiveImage';
import type { ResponsivePictureProps } from './utils/types';

// ========================================
// Responsive Picture Component
// ========================================

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

  // Sort sources by format preference
  const sortedSources = [...sources].sort((a, b) => {
    const formatPriority: Record<string, number> = { avif: 3, webp: 2, jpg: 1, png: 1 };
    const aFormat = a.format || 'jpg';
    const bFormat = b.format || 'jpg';
    return (formatPriority[bFormat] || 1) - (formatPriority[aFormat] || 1);
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
