"use client";

import { useState, useRef, useEffect, MouseEvent } from "react";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";

interface Coordinate {
  x: number;
  y: number;
}

interface ImageMarkerSheetProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id: string;
    preview: string;
    name: string;
  };
  initialCoordinates: Coordinate[];
  onSave: (coordinates: Coordinate[]) => void;
  onNavigate?: (direction: 'next' | 'prev') => void;
  currentIndex?: number;
  totalImages?: number;
}

export default function ImageMarkerSheet({
  isOpen,
  onClose,
  image,
  initialCoordinates,
  onSave,
  onNavigate,
  currentIndex,
  totalImages,
}: ImageMarkerSheetProps) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>(initialCoordinates);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setCoordinates(initialCoordinates);
  }, [initialCoordinates, image.id]);

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setCoordinates([...coordinates, { x, y }]);
  };

  const handleMarkerClick = (index: number, e: MouseEvent) => {
    e.stopPropagation();
    setCoordinates(coordinates.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave(coordinates);
    onClose();
  };

  const handleCancel = () => {
    setCoordinates(initialCoordinates);
    onClose();
  };

  const handleNavigate = (direction: 'next' | 'prev') => {
    if (!onNavigate) return;
    onSave(coordinates);
    onNavigate(direction);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <SheetContent side="right" className="w-full sm:max-w-4xl">
        <div className="flex items-center justify-between">
          <SheetTitle>{image.name}</SheetTitle>
          {onNavigate && typeof currentIndex === 'number' && typeof totalImages === 'number' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {currentIndex + 1} of {totalImages}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col h-full pt-2">
          <div className="mb-4">
            <p className="text-sm text-gray-500">
              Click on the image to place markers. Click markers to remove them.
            </p>
          </div>

          <div className="flex-1 overflow-auto mb-4 relative">
            {onNavigate && typeof currentIndex === 'number' && currentIndex > 0 && (
              <button
                onClick={() => handleNavigate('prev')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            <div
              className="relative inline-block cursor-crosshair"
              onClick={handleImageClick}
            >
              <img
                ref={imageRef}
                src={image.preview}
                alt={image.name}
                className="max-w-full h-auto"
              />
              {coordinates.map((coord, index) => (
                <button
                  key={index}
                  onClick={(e) => handleMarkerClick(index, e)}
                  className="absolute w-8 h-8 -ml-4 -mt-4 bg-red-500 text-white rounded-full border-2 border-white shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center text-xs font-bold"
                  style={{
                    left: `${coord.x}%`,
                    top: `${coord.y}%`,
                  }}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {onNavigate && typeof currentIndex === 'number' && typeof totalImages === 'number' && currentIndex < totalImages - 1 && (
              <button
                onClick={() => handleNavigate('next')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          <SheetFooter>
            <div className="flex gap-2 w-full">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save {coordinates.length} Marker{coordinates.length !== 1 ? "s" : ""}
              </button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
