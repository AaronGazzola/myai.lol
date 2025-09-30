export interface MarkupElement {
  id: string;
  type: 'circle' | 'rectangle' | 'arrow' | 'text';
  color: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  endX?: number;
  endY?: number;
  text?: string;
  fontSize?: number;
}

export interface MarkedImage {
  originalUrl: string;
  markedUrl: string;
  markup: MarkupElement[];
  description: string;
}

export async function applyMarkupToImage(
  imageUrl: string,
  markup: MarkupElement[]
): Promise<string> {
  return new Promise((resolve, reject) => {
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

      markup.forEach((element) => {
        ctx.strokeStyle = element.color;
        ctx.fillStyle = element.color;
        ctx.lineWidth = 3;

        switch (element.type) {
          case 'circle':
            if (element.radius) {
              ctx.beginPath();
              ctx.arc(element.x, element.y, element.radius, 0, 2 * Math.PI);
              ctx.stroke();
            }
            break;

          case 'rectangle':
            if (element.width && element.height) {
              ctx.strokeRect(element.x, element.y, element.width, element.height);
            }
            break;

          case 'arrow':
            if (element.endX !== undefined && element.endY !== undefined) {
              drawArrow(ctx, element.x, element.y, element.endX, element.endY, element.color);
            }
            break;

          case 'text':
            if (element.text) {
              const fontSize = element.fontSize || 24;
              ctx.font = `bold ${fontSize}px sans-serif`;
              ctx.fillStyle = element.color;
              ctx.strokeStyle = 'white';
              ctx.lineWidth = 3;
              ctx.strokeText(element.text, element.x, element.y);
              ctx.fillText(element.text, element.x, element.y);
            }
            break;
        }
      });

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create marked image'));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read marked image'));
          reader.readAsDataURL(blob);
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string
): void {
  const headLength = 20;
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.PI / 6),
    toY - headLength * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.PI / 6),
    toY - headLength * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

export function generateMarkupDescription(markup: MarkupElement[]): string {
  if (markup.length === 0) {
    return 'No markup applied to this image.';
  }

  const descriptions: string[] = [];

  markup.forEach((element, index) => {
    const position = `at position (${Math.round(element.x)}, ${Math.round(element.y)})`;

    switch (element.type) {
      case 'circle':
        descriptions.push(
          `Circle ${index + 1}: ${element.color} circle ${position} with radius ${element.radius}`
        );
        break;

      case 'rectangle':
        descriptions.push(
          `Rectangle ${index + 1}: ${element.color} rectangle ${position} with dimensions ${element.width}x${element.height}`
        );
        break;

      case 'arrow':
        descriptions.push(
          `Arrow ${index + 1}: ${element.color} arrow from ${position} to (${element.endX}, ${element.endY})`
        );
        break;

      case 'text':
        descriptions.push(`Text ${index + 1}: "${element.text}" in ${element.color} ${position}`);
        break;
    }
  });

  return `This image has been marked with the following annotations:\n${descriptions.join('\n')}`;
}

export async function exportMarkedImage(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to export marked image'));
          return;
        }
        resolve(blob);
      },
      'image/png',
      1.0
    );
  });
}

export async function convertImageFormat(
  imageUrl: string,
  format: 'png' | 'jpeg' | 'webp',
  quality: number = 0.9
): Promise<string> {
  return new Promise((resolve, reject) => {
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

      if (format === 'jpeg') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const mimeType = `image/${format}`;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image format'));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read converted image'));
          reader.readAsDataURL(blob);
        },
        mimeType,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

export async function optimizeForModel(
  imageUrl: string,
  modelName: string
): Promise<string> {
  const modelConfigs: Record<string, { maxSize: number; format: 'png' | 'jpeg' | 'webp'; quality: number }> = {
    'openai/gpt-4o': { maxSize: 2048, format: 'jpeg', quality: 0.9 },
    'anthropic/claude-3.5-sonnet': { maxSize: 1568, format: 'jpeg', quality: 0.85 },
    'google/gemini-pro-vision': { maxSize: 2048, format: 'jpeg', quality: 0.9 },
  };

  const config = modelConfigs[modelName] || { maxSize: 2048, format: 'jpeg' as const, quality: 0.9 };

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = async () => {
      let { width, height } = img;

      if (width > config.maxSize || height > config.maxSize) {
        const scale = Math.min(config.maxSize / width, config.maxSize / height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      if (config.format === 'jpeg') {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to optimize image'));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read optimized image'));
          reader.readAsDataURL(blob);
        },
        `image/${config.format}`,
        config.quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}

export async function batchProcessImages<T>(
  images: string[],
  processor: (imageUrl: string) => Promise<T>,
  onProgress?: (completed: number, total: number) => void
): Promise<T[]> {
  const results: T[] = [];
  let completed = 0;

  for (const imageUrl of images) {
    try {
      const result = await processor(imageUrl);
      results.push(result);
      completed++;
      if (onProgress) {
        onProgress(completed, images.length);
      }
    } catch (error) {
      console.error(JSON.stringify({label:'batchProcessImages',error:error instanceof Error?error.message:'Unknown error',imageUrl},null,0));
      throw error;
    }
  }

  return results;
}

export function createMarkupCanvas(
  imageUrl: string,
  onLoad: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
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
      onLoad(canvas, ctx);
      resolve();
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
}