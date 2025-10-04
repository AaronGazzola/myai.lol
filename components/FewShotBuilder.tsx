"use client";

import { useState } from "react";
import { cn } from "@/lib/shadcn.utils";
import DropZone from "./DropZone";
import ImageMarkerSheet from "./ImageMarkerSheet";

export interface Coordinate {
  x: number;
  y: number;
}

export interface ExampleImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
  coordinates: Coordinate[];
}

export interface FewShotConfig {
  targetImageId: string | null;
  targetImage?: ExampleImage;
  exampleImages: ExampleImage[];
}

interface FewShotBuilderProps {
  config: FewShotConfig;
  onChange: (config: FewShotConfig) => void;
}

const TEMPLATES = [
  {
    id: "counting",
    name: "Object Counting",
    exampleFormat: "Contains X [objects]",
    description: "Count specific objects in images",
  },
  {
    id: "identification",
    name: "Object Identification",
    exampleFormat: "Contains: [list of objects]",
    description: "Identify and list objects",
  },
  {
    id: "classification",
    name: "Classification",
    exampleFormat: "Category: [category name]",
    description: "Classify images into categories",
  },
];

export default function FewShotBuilder({
  config,
  onChange,
}: FewShotBuilderProps) {
  const [markerSheetOpen, setMarkerSheetOpen] = useState(false);
  const [selectedImageForMarkers, setSelectedImageForMarkers] = useState<ExampleImage | null>(null);

  const handleExampleImagesUploaded = (images: Array<{ id: string; file: File; preview: string; name: string; size: number }>) => {
    const newExampleImages: ExampleImage[] = images.map((img) => ({
      ...img,
      coordinates: [],
    }));
    onChange({
      ...config,
      exampleImages: [...config.exampleImages, ...newExampleImages],
    });
  };

  const handleRemoveExampleImage = (id: string) => {
    onChange({
      ...config,
      exampleImages: config.exampleImages.filter((img) => img.id !== id),
    });
  };

  const handleReorderExampleImages = (fromIndex: number, toIndex: number) => {
    const reordered = [...config.exampleImages];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    onChange({
      ...config,
      exampleImages: reordered,
    });
  };

  const handleOpenMarkerSheet = (image: ExampleImage) => {
    setSelectedImageForMarkers(image);
    setMarkerSheetOpen(true);
  };

  const handleSaveMarkers = (coordinates: Coordinate[]) => {
    if (!selectedImageForMarkers) return;

    const updatedImages = config.exampleImages.map((img) =>
      img.id === selectedImageForMarkers.id ? { ...img, coordinates } : img
    );

    onChange({
      ...config,
      exampleImages: updatedImages,
    });
  };

  const setTargetImage = (imageId: string) => {
    onChange({
      ...config,
      targetImageId: config.targetImageId === imageId ? null : imageId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Few-Shot Learning Workflow</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Upload 2+ images below</li>
          <li>Mark coordinates on example images</li>
          <li>Select one image as the target (to be analyzed)</li>
        </ol>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Upload Images
        </label>
        <DropZone
          onImagesUploaded={handleExampleImagesUploaded}
          uploadedImages={config.exampleImages}
          onRemoveImage={handleRemoveExampleImage}
          onReorderImages={handleReorderExampleImages}
        />
      </div>

      {config.exampleImages.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Mark Coordinates & Select Target
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Click images to mark target coordinates. Click the &quot;Target&quot; button to select which image to analyze.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {config.exampleImages.map((image) => {
              const isTarget = config.targetImageId === image.id;
              return (
                <div
                  key={image.id}
                  className={cn(
                    "relative rounded-lg overflow-hidden border-2 transition-all duration-200",
                    isTarget ? "border-green-500 ring-2 ring-green-200" : "border-gray-200"
                  )}
                >
                  <button
                    onClick={() => handleOpenMarkerSheet(image)}
                    className="relative group w-full"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={image.preview}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-sm font-medium">
                          {image.coordinates.length > 0 ? "Edit markers" : "Mark coordinates"}
                        </div>
                      </div>
                    </div>
                    {image.coordinates.length > 0 && (
                      <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                        {image.coordinates.length}
                      </div>
                    )}
                    {isTarget && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs font-bold rounded shadow-lg">
                        TARGET
                      </div>
                    )}
                  </button>
                  <div className="p-2 bg-white flex items-center justify-between gap-2">
                    <p className="text-xs font-medium text-gray-700 truncate flex-1">
                      {image.name}
                    </p>
                    <button
                      onClick={() => setTargetImage(image.id)}
                      className={cn(
                        "text-xs px-2 py-1 rounded transition-colors flex-shrink-0",
                        isTarget
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-green-100 hover:text-green-700"
                      )}
                    >
                      {isTarget ? "Target ✓" : "Set Target"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedImageForMarkers && (
        <ImageMarkerSheet
          isOpen={markerSheetOpen}
          onClose={() => {
            setMarkerSheetOpen(false);
            setSelectedImageForMarkers(null);
          }}
          image={selectedImageForMarkers}
          initialCoordinates={selectedImageForMarkers.coordinates}
          onSave={handleSaveMarkers}
        />
      )}

      {config.exampleImages.length > 0 && config.targetImageId && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-green-700">
              Ready to analyze! {config.exampleImages.filter(img => img.id !== config.targetImageId).length} example image{config.exampleImages.filter(img => img.id !== config.targetImageId).length !== 1 ? "s" : ""} with coordinates and 1 target image.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}