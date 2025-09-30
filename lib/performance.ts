export async function compressImage(file: File, maxSizeMB: number = 1): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const maxDimension = 2048;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }

            const targetSize = maxSizeMB * 1024 * 1024;
            if (blob.size > targetSize) {
              const quality = Math.min(0.9, targetSize / blob.size);
              canvas.toBlob(
                (compressedBlob) => {
                  if (!compressedBlob) {
                    reject(new Error('Compression failed'));
                    return;
                  }
                  const compressedFile = new File([compressedBlob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now()
                  });
                  resolve(compressedFile);
                },
                'image/jpeg',
                quality
              );
            } else {
              const newFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(newFile);
            }
          },
          file.type,
          0.9
        );
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

export function createImageCache() {
  const cache = new Map<string, string>();
  const maxSize = 50;

  return {
    get(key: string): string | undefined {
      return cache.get(key);
    },
    set(key: string, value: string): void {
      if (cache.size >= maxSize) {
        const firstKey = cache.keys().next().value as string | undefined;
        if (firstKey) {
          cache.delete(firstKey);
        }
      }
      cache.set(key, value);
    },
    has(key: string): boolean {
      return cache.has(key);
    },
    clear(): void {
      cache.clear();
    }
  };
}

export const imageCache = createImageCache();

export async function lazyLoadImage(src: string): Promise<string> {
  if (imageCache.has(src)) {
    return imageCache.get(src)!;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(src, src);
      resolve(src);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function memoize<T extends (...args: never[]) => unknown>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

export function cleanupMemory() {
  imageCache.clear();

  if (typeof window !== 'undefined' && 'gc' in window && typeof (window as { gc?: () => void }).gc === 'function') {
    try {
      (window as { gc: () => void }).gc();
    } catch (e) {
      console.error(JSON.stringify({ error: 'Manual GC failed', details: e }, null, 0));
    }
  }
}

export function monitorPerformance(label: string, fn: () => void) {
  const start = performance.now();
  fn();
  const duration = performance.now() - start;
  if (duration > 100) {
    console.warn(JSON.stringify({ slow_operation: label, duration_ms: duration }, null, 0));
  }
}

export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 3
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }

  return results;
}