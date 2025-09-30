import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  format: string;
  name: string;
}

export interface StoredImage {
  id: string;
  preview: string;
  thumbnail: string;
  metadata: ImageMetadata;
  usedInCards: string[];
  uploadedAt: number;
}

interface ImageState {
  images: StoredImage[];
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  updateImageMetadata: (id: string, metadata: Partial<ImageMetadata>) => void;
  getImageUsage: (id: string) => string[];
  getUnassignedImages: () => StoredImage[];
  clearUnusedImages: () => void;
  linkImageToCard: (imageId: string, cardId: string) => void;
  unlinkImageFromCard: (imageId: string, cardId: string) => void;
  clearAllImages: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const createThumbnail = (file: File, maxSize: number = 200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = reject;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const extractMetadata = (file: File): Promise<ImageMetadata> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          format: file.type.split('/')[1] || 'unknown',
          name: file.name,
        });
      };

      img.onerror = () => {
        resolve({
          width: 0,
          height: 0,
          size: file.size,
          format: file.type.split('/')[1] || 'unknown',
          name: file.name,
        });
      };
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const useImageStore = create<ImageState>()(
  persist(
    (set, get) => ({
      images: [],

      addImages: async (files: File[]) => {
        const newImages: StoredImage[] = [];

        for (const file of files) {
          try {
            const [preview, thumbnail, metadata] = await Promise.all([
              createImagePreview(file),
              createThumbnail(file),
              extractMetadata(file),
            ]);

            newImages.push({
              id: generateId(),
              preview,
              thumbnail,
              metadata,
              usedInCards: [],
              uploadedAt: Date.now(),
            });
          } catch (error) {
            console.error(JSON.stringify({label:"imageStore:addImages",error,file:file.name}));
          }
        }

        set((state) => ({
          images: [...state.images, ...newImages],
        }));
      },

      removeImage: (id: string) => {
        set((state) => ({
          images: state.images.filter((img) => img.id !== id),
        }));
      },

      updateImageMetadata: (id: string, metadata: Partial<ImageMetadata>) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id
              ? { ...img, metadata: { ...img.metadata, ...metadata } }
              : img
          ),
        }));
      },

      getImageUsage: (id: string) => {
        const state = get();
        const image = state.images.find((img) => img.id === id);
        return image?.usedInCards || [];
      },

      getUnassignedImages: () => {
        const state = get();
        return state.images.filter((img) => img.usedInCards.length === 0);
      },

      clearUnusedImages: () => {
        set((state) => ({
          images: state.images.filter((img) => img.usedInCards.length > 0),
        }));
      },

      linkImageToCard: (imageId: string, cardId: string) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === imageId && !img.usedInCards.includes(cardId)
              ? { ...img, usedInCards: [...img.usedInCards, cardId] }
              : img
          ),
        }));
      },

      unlinkImageFromCard: (imageId: string, cardId: string) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === imageId
              ? { ...img, usedInCards: img.usedInCards.filter((id) => id !== cardId) }
              : img
          ),
        }));
      },

      clearAllImages: () => {
        set({ images: [] });
      },
    }),
    {
      name: 'image-storage',
      partialize: (state) => ({ images: state.images }),
    }
  )
);