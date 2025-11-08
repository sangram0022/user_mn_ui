// ========================================
// Image Loading Hook
// ========================================

import { useState, useEffect, useRef, useCallback } from 'react';
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

  const loadImage = useCallback(async (imageSrc: string) => {
    if (isLoading || isLoaded) return;
    
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
  }, [isLoading, isLoaded]);

  useEffect(() => {
    if (shouldLoad && src) {
      loadImage(src);
    }
  }, [shouldLoad, src, loadImage]);

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