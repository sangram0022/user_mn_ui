// ========================================
// Modern Format Detection
// ========================================

export class FormatDetector {
  private static supportCache = new Map<string, boolean>();

  /**
   * Check if browser supports modern image formats
   */
  static async supportsFormat(format: 'webp' | 'avif'): Promise<boolean> {
    // Return cached result if available
    if (this.supportCache.has(format)) {
      return this.supportCache.get(format)!;
    }

    // Test format support
    const testImages = {
      webp: 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA',
      avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgS0AAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=',
    };

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const supported = img.width === 1 && img.height === 1;
        this.supportCache.set(format, supported);
        resolve(supported);
      };
      img.onerror = () => {
        this.supportCache.set(format, false);
        resolve(false);
      };
      img.src = testImages[format];
    });
  }

  /**
   * Get best supported format for current browser
   */
  static async getBestFormat(): Promise<'avif' | 'webp' | 'jpg'> {
    if (await this.supportsFormat('avif')) return 'avif';
    if (await this.supportsFormat('webp')) return 'webp';
    return 'jpg';
  }
}
