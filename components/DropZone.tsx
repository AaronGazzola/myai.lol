"use client";

import { useState, useCallback, DragEvent } from "react";
import { cn } from "@/lib/shadcn.utils";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
}

interface DropZoneProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
  uploadedImages: UploadedImage[];
  onRemoveImage: (id: string) => void;
  onReorderImages: (fromIndex: number, toIndex: number) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
}

export default function DropZone({
  onImagesUploaded,
  uploadedImages,
  onRemoveImage,
  onReorderImages,
  maxSizeMB = 10,
  acceptedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const validateFiles = useCallback(
    (files: FileList | File[]): { valid: UploadedImage[]; errors: string[] } => {
      const valid: UploadedImage[] = [];
      const errors: string[] = [];
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      Array.from(files).forEach((file) => {
        if (!acceptedFormats.includes(file.type)) {
          errors.push(`${file.name}: Invalid format. Accepted: jpg, png, webp, gif`);
          return;
        }

        if (file.size > maxSizeBytes) {
          errors.push(`${file.name}: Exceeds ${maxSizeMB}MB limit`);
          return;
        }

        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const preview = URL.createObjectURL(file);

        valid.push({
          id,
          file,
          preview,
          name: file.name,
          size: file.size,
        });
      });

      return { valid, errors };
    },
    [maxSizeMB, acceptedFormats]
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      setError(null);

      const files = e.dataTransfer.files;
      if (files.length === 0) return;

      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        setError(errors.join(", "));
      }

      if (valid.length > 0) {
        onImagesUploaded(valid);
      }
    },
    [validateFiles, onImagesUploaded]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null);
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const { valid, errors } = validateFiles(files);

      if (errors.length > 0) {
        setError(errors.join(", "));
      }

      if (valid.length > 0) {
        onImagesUploaded(valid);
      }

      e.target.value = "";
    },
    [validateFiles, onImagesUploaded]
  );

  const handleImageDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleImageDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleImageDrop = useCallback(
    (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();
      e.stopPropagation();

      if (draggedIndex !== null && draggedIndex !== dropIndex) {
        onReorderImages(draggedIndex, dropIndex);
      }
      setDraggedIndex(null);
    },
    [draggedIndex, onReorderImages]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200",
          isDragOver
            ? "border-blue-500 bg-blue-50 scale-[1.02]"
            : "border-gray-300 bg-gray-50 hover:border-gray-400"
        )}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept={acceptedFormats.join(",")}
          onChange={handleFileInput}
          className="hidden"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop images here or click to upload
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports: JPG, PNG, WebP, GIF (max {maxSizeMB}MB each)
              </p>
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {uploadedImages.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Uploaded Images ({uploadedImages.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleImageDragStart(index)}
                onDragOver={(e) => handleImageDragOver(e)}
                onDrop={(e) => handleImageDrop(e, index)}
                className={cn(
                  "relative group rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-move",
                  draggedIndex === index
                    ? "border-blue-500 opacity-50 scale-95"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="aspect-square relative">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200" />
                </div>

                <button
                  onClick={() => onRemoveImage(image.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  aria-label="Remove image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="p-2 bg-white">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-500">{formatFileSize(image.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}