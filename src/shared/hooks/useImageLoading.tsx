// ========================================
// Image Loading Hook
// ========================================

import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

interface UseImageLoadingOptions {
  lazy?: boolean;
  rootMargin?: string;
  threshold?: number;
  placeholder?: boolean;
}

export function useImageLoading(
  src: string,
  options: UseImageLoadingOptions = {}
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  
  const imgRef = useRef<HTMLImageElement>(null);
  
  const { inView } = useInView({
    threshold: options.threshold || 0.1,
    rootMargin: options.rootMargin || '50px',
    triggerOnce: true,
  });

  const shouldLoad = !options.lazy || inView;

  // Move loadImage inside useEffect to avoid dependency issues
  useEffect(() => {
    if (!shouldLoad || !src) return;
    if (isLoading || isLoaded) return;

    const loadImage = async (imageSrc: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const img = new Image();
        
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error(`Failed to load image: ${imageSrc}`));
          img.src = imageSrc;
        });

        setCurrentSrc(imageSrc);
        setIsLoaded(true);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage(src);
  }, [shouldLoad, src, isLoading, isLoaded]);

  return {
    isLoaded,
    isLoading,
    error,
    currentSrc,
    shouldLoad,
    imgRef,
  };
}

export type { UseImageLoadingOptions };