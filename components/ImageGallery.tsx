'use client';

import { useState } from 'react';
import { ProcessedImage } from '@/lib/fileUpload';

interface ImageGalleryProps {
  images: ProcessedImage[];
  selectedImages?: string[];
  onSelectImage?: (imageId: string) => void;
  onDeleteImage?: (imageId: string) => void;
  onReorderImages?: (fromIndex: number, toIndex: number) => void;
  onDownloadImages?: (imageIds: string[]) => void;
  enableSelection?: boolean;
  enableBulkActions?: boolean;
  className?: string;
}

export default function ImageGallery({
  images,
  selectedImages = [],
  onSelectImage,
  onDeleteImage,
  onReorderImages,
  onDownloadImages,
  enableSelection = true,
  enableBulkActions = true,
  className = '',
}: ImageGalleryProps) {
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleImageClick = (imageId: string) => {
    if (!enableSelection || !onSelectImage) return;
    onSelectImage(imageId);
  };

  const handleDeleteClick = (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    if (onDeleteImage) {
      onDeleteImage(imageId);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      if (onReorderImages) {
        onReorderImages(draggedIndex, dragOverIndex);
      }
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSelectAll = () => {
    if (!onSelectImage) return;
    images.forEach((img) => {
      if (!selectedImages.includes(img.id)) {
        onSelectImage(img.id);
      }
    });
  };

  const handleDeselectAll = () => {
    if (!onSelectImage) return;
    selectedImages.forEach((id) => onSelectImage(id));
  };

  const handleDeleteSelected = () => {
    if (!onDeleteImage) return;
    selectedImages.forEach((id) => onDeleteImage(id));
  };

  const handleDownloadSelected = () => {
    if (onDownloadImages) {
      onDownloadImages(selectedImages);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`w-full ${className}`}>
      {enableBulkActions && images.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {images.length} image{images.length !== 1 ? 's' : ''}
              {selectedImages.length > 0 && ` (${selectedImages.length} selected)`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedImages.length > 0 ? (
              <>
                <button
                  onClick={handleDeselectAll}
                  className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
                >
                  Deselect All
                </button>
                {onDownloadImages && (
                  <button
                    onClick={handleDownloadSelected}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </button>
                )}
                {onDeleteImage && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 rounded transition-colors"
              >
                Select All
              </button>
            )}
          </div>
        </div>
      )}

      {images.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">No images uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {images.map((image, index) => {
            const isSelected = selectedImages.includes(image.id);
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <div
                key={image.id}
                draggable={!!onReorderImages}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => handleImageClick(image.id)}
                onMouseEnter={() => setHoveredImageId(image.id)}
                onMouseLeave={() => setHoveredImageId(null)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isDragging ? 'opacity-50' : ''} ${isDragOver ? 'scale-95' : ''}`}
              >
                <img
                  src={image.thumbnail}
                  alt={image.file.name}
                  className="w-full h-full object-cover"
                  data-image-id={image.id}
                />

                {isSelected && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                {onDeleteImage && (
                  <button
                    onClick={(e) => handleDeleteClick(e, image.id)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 flex items-center justify-center"
                    style={{
                      opacity: hoveredImageId === image.id ? 1 : 0,
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}

                {hoveredImageId === image.id && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3">
                    <p className="text-white text-xs truncate mb-1">{image.file.name}</p>
                    <div className="flex items-center justify-between text-white/75 text-xs">
                      <span>
                        {image.metadata.width} × {image.metadata.height}
                      </span>
                      <span>{formatFileSize(image.metadata.size)}</span>
                    </div>
                  </div>
                )}

                {onReorderImages && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-gray-900/50 rounded flex items-center justify-center cursor-move">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}