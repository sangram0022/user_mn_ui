/**
 * Storage Compression Utilities
 * Compresses/decompresses data for efficient storage
 *
 * NOTE: For production use with large data, consider using
 * a compression library like pako or lz-string
 */

/**
 * Simple compression using JSON stringify
 * For production, use a proper compression library
 */
export function compressStorageValue(value: unknown): string {
  try {
    // For production, implement proper compression using pako or lz-string
    // This is a simple JSON stringify for demonstration
    return JSON.stringify(value);
  } catch (error) {
    console.error('Compression error:', error);
    return String(value);
  }
}

/**
 * Simple decompression using JSON parse
 * For production, use a proper compression library
 */
export function decompressStorageValue<T = unknown>(compressed: string): T {
  try {
    // For production, implement proper decompression using pako or lz-string
    // This is a simple JSON parse for demonstration
    return JSON.parse(compressed) as T;
  } catch (error) {
    console.error('Decompression error:', error);
    return compressed as T;
  }
}

/**
 * Production-ready compression using CompressionStream API (modern browsers)
 * Uncomment and use this for production if supported
 */
/*
export async function compressStorageValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);

  const stream = new Response(data).body!
    .pipeThrough(new CompressionStream('gzip'));

  const compressed = await new Response(stream).arrayBuffer();

  return btoa(String.fromCharCode(...new Uint8Array(compressed)));
}

export async function decompressStorageValue(compressed: string): Promise<string> {
  const data = Uint8Array.from(atob(compressed), c => c.charCodeAt(0));

  const stream = new Response(data).body!
    .pipeThrough(new DecompressionStream('gzip'));

  const decompressed = await new Response(stream).arrayBuffer();

  const decoder = new TextDecoder();
  return decoder.decode(decompressed);
}
*/

/**
 * Get storage size estimate
 */
export function getStorageSize(value: unknown): number {
  try {
    const serialized = JSON.stringify(value);
    return new Blob([serialized]).size;
  } catch (error) {
    console.error('Size calculation error:', error);
    return 0;
  }
}
