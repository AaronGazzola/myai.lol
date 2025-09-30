export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
  aspectRatio: number;
}

export interface ProcessedImage {
  id: string;
  file: File;
  thumbnail: string;
  preview: string;
  metadata: ImageMetadata;
  error?: string;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  loaded: number;
  total: number;
  percentage: number;
  status: 'pending' | 'processing' | 'complete' | 'error';
  error?: string;
}

const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const THUMBNAIL_SIZE = 150;
const PREVIEW_MAX_WIDTH = 1200;

export async function processUploadedFiles(
  files: File[],
  onProgress?: (progress: UploadProgress[]) => void
): Promise<ProcessedImage[]> {
  const progressMap = new Map<string, UploadProgress>();

  files.forEach((file) => {
    const fileId = `${file.name}-${Date.now()}-${Math.random()}`;
    progressMap.set(fileId, {
      fileId,
      fileName: file.name,
      loaded: 0,
      total: file.size,
      percentage: 0,
      status: 'pending',
    });
  });

  if (onProgress) {
    onProgress(Array.from(progressMap.values()));
  }

  const processedImages = await Promise.all(
    files.map(async (file) => {
      const fileId = Array.from(progressMap.keys()).find(
        (id) => progressMap.get(id)?.fileName === file.name
      )!;
      const progress = progressMap.get(fileId)!;

      try {
        const validationError = validateImageForAPI(file);
        if (validationError) {
          progress.status = 'error';
          progress.error = validationError;
          if (onProgress) onProgress(Array.from(progressMap.values()));
          return null;
        }

        progress.status = 'processing';
        progress.percentage = 25;
        if (onProgress) onProgress(Array.from(progressMap.values()));

        const metadata = await extractImageMetadata(file);

        progress.percentage = 50;
        if (onProgress) onProgress(Array.from(progressMap.values()));

        const thumbnail = await generateThumbnail(file, THUMBNAIL_SIZE);

        progress.percentage = 75;
        if (onProgress) onProgress(Array.from(progressMap.values()));

        const preview = await generatePreview(file, PREVIEW_MAX_WIDTH);

        progress.status = 'complete';
        progress.percentage = 100;
        if (onProgress) onProgress(Array.from(progressMap.values()));

        return {
          id: fileId,
          file,
          thumbnail,
          preview,
          metadata,
        };
      } catch (error) {
        progress.status = 'error';
        progress.error = error instanceof Error ? error.message : 'Processing failed';
        if (onProgress) onProgress(Array.from(progressMap.values()));
        return null;
      }
    })
  );

  return processedImages.filter((img): img is ProcessedImage => img !== null);
}

export function validateImageForAPI(file: File): string | null {
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return `Unsupported format: ${file.type}. Please use JPG, PNG, WebP, or GIF.`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
  }

  return null;
}

export async function extractImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
        format: file.type.split('/')[1],
        size: file.size,
        aspectRatio: img.width / img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

export async function generateThumbnail(file: File, size: number): Promise<string> {
  return resizeImage(file, size, size);
}

export async function generatePreview(file: File, maxWidth: number): Promise<string> {
  const metadata = await extractImageMetadata(file);
  const scale = Math.min(1, maxWidth / metadata.width);
  const targetWidth = Math.floor(metadata.width * scale);
  const targetHeight = Math.floor(metadata.height * scale);

  return resizeImage(file, targetWidth, targetHeight);
}

export async function compressImage(file: File, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read compressed image'));
            reader.readAsDataURL(blob);
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

async function resizeImage(file: File, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to resize image'));
              return;
            }

            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read resized image'));
            reader.readAsDataURL(blob);
          },
          file.type,
          0.9
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export function cleanupTempFiles(imageIds: string[]): void {
  imageIds.forEach((id) => {
    const elements = document.querySelectorAll(`[data-image-id="${id}"]`);
    elements.forEach((el) => {
      if (el instanceof HTMLImageElement) {
        URL.revokeObjectURL(el.src);
      }
    });
  });
}