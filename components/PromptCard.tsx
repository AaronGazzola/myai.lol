"use client";

import { useState } from "react";
import { cn } from "@/lib/shadcn.utils";
import { FewShotConfig, ExampleImage, Coordinate } from "./FewShotBuilder";
import VisualPointingEditor, { VisualPointingConfig } from "./VisualPointingEditor";
import MultiImageBuilder, { MultiImageConfig } from "./MultiImageBuilder";
import DropZone from "./DropZone";
import ImageMarkerSheet from "./ImageMarkerSheet";

export type TechniqueType =
  | "standard"
  | "few-shot"
  | "visual-pointing"
  | "multi-image";

export type FewShotSubCategory = "counting" | "identification" | "classification";

export interface PromptCardConfig {
  id: string;
  technique: TechniqueType;
  prompt: string;
  assignedImages: string[];
  selectedSubCategory?: FewShotSubCategory;
  metadata?: {
    fewShot?: FewShotConfig;
    visualPointing?: VisualPointingConfig;
    multiImage?: MultiImageConfig;
  };
}

interface PromptCardProps {
  config: PromptCardConfig;
  onUpdate: (config: PromptCardConfig) => void;
  onAddBelow: () => void;
  onDelete: () => void;
  uploadedImages: Array<{ id: string; preview: string; name: string }>;
}

const TECHNIQUES = [
  {
    id: "standard" as TechniqueType,
    name: "Standard Prompt",
    description: "Single image with text prompt",
    hasSubCategories: false,
  },
  {
    id: "few-shot" as TechniqueType,
    name: "Few-Shot Learning",
    description: "Examples with labels + target image",
    hasSubCategories: true,
  },
  {
    id: "visual-pointing" as TechniqueType,
    name: "Visual Pointing",
    description: "Markup regions on image",
    hasSubCategories: false,
  },
  {
    id: "multi-image" as TechniqueType,
    name: "Multi-Image Context",
    description: "Reference images + target",
    hasSubCategories: false,
  },
];

const SUB_CATEGORIES: { id: FewShotSubCategory; name: string; description: string }[] = [
  { id: "counting", name: "Object Counting", description: "Count specific objects in images" },
  { id: "identification", name: "Object Identification", description: "Identify and list objects" },
  { id: "classification", name: "Classification", description: "Classify images into categories" },
];

export default function PromptCard({
  config,
  onUpdate,
  onAddBelow,
  onDelete,
  uploadedImages,
}: PromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [markerSheetOpen, setMarkerSheetOpen] = useState(false);
  const [selectedExampleImageIndex, setSelectedExampleImageIndex] = useState<number | null>(null);

  const handleTechniqueChange = (technique: TechniqueType) => {
    const newConfig = { ...config, technique };

    if (technique === "few-shot" && !config.metadata?.fewShot) {
      newConfig.metadata = {
        ...config.metadata,
        fewShot: { targetImageId: null, exampleImages: [] },
      };
    } else if (technique === "visual-pointing" && !config.metadata?.visualPointing) {
      newConfig.metadata = {
        ...config.metadata,
        visualPointing: { imageId: null, markups: [] },
      };
    } else if (technique === "multi-image" && !config.metadata?.multiImage) {
      newConfig.metadata = {
        ...config.metadata,
        multiImage: {
          referenceImageIds: [],
          targetImageId: null,
          relationshipType: "comparison",
          contextDescription: "",
        },
      };
    }

    onUpdate(newConfig);
  };

  const handleSubCategoryChange = (subCategory: FewShotSubCategory) => {
    onUpdate({ ...config, selectedSubCategory: subCategory });
  };

  const handlePromptChange = (prompt: string) => {
    onUpdate({ ...config, prompt });
  };

  const handleImageSelect = (imageId: string) => {
    const assigned = config.assignedImages.includes(imageId)
      ? config.assignedImages.filter((id) => id !== imageId)
      : [...config.assignedImages, imageId];
    onUpdate({ ...config, assignedImages: assigned });
  };

  const handleVisualPointingChange = (visualPointingConfig: VisualPointingConfig) => {
    onUpdate({
      ...config,
      metadata: { ...config.metadata, visualPointing: visualPointingConfig },
    });
  };

  const handleMultiImageChange = (multiImageConfig: MultiImageConfig) => {
    onUpdate({
      ...config,
      metadata: { ...config.metadata, multiImage: multiImageConfig },
    });
  };

  const handleTargetImageUpload = (images: Array<{ id: string; file: File; preview: string; name: string; size: number }>) => {
    if (images.length === 0 || !config.metadata?.fewShot) return;
    const targetImage: ExampleImage = {
      ...images[0],
      coordinates: [],
    };
    onUpdate({
      ...config,
      metadata: {
        ...config.metadata,
        fewShot: {
          ...config.metadata.fewShot,
          targetImage,
        },
      },
    });
  };

  const handleRemoveTargetImage = () => {
    if (!config.metadata?.fewShot) return;
    onUpdate({
      ...config,
      metadata: {
        ...config.metadata,
        fewShot: {
          ...config.metadata.fewShot,
          targetImage: undefined,
        },
      },
    });
  };

  const handleExampleImagesUpload = (images: Array<{ id: string; file: File; preview: string; name: string; size: number }>) => {
    if (!config.metadata?.fewShot) return;
    const currentExamples = config.metadata.fewShot.exampleImages || [];
    if (currentExamples.length + images.length > 4) return;

    const newExamples: ExampleImage[] = images.map((img) => ({
      ...img,
      coordinates: [],
    }));

    onUpdate({
      ...config,
      metadata: {
        ...config.metadata,
        fewShot: {
          ...config.metadata.fewShot,
          exampleImages: [...currentExamples, ...newExamples],
        },
      },
    });
  };

  const handleRemoveExampleImage = (id: string) => {
    if (!config.metadata?.fewShot) return;
    onUpdate({
      ...config,
      metadata: {
        ...config.metadata,
        fewShot: {
          ...config.metadata.fewShot,
          exampleImages: config.metadata.fewShot.exampleImages.filter((img) => img.id !== id),
        },
      },
    });
  };

  const handleOpenMarkerSheet = (index: number) => {
    setSelectedExampleImageIndex(index);
    setMarkerSheetOpen(true);
  };

  const handleSaveMarkers = (coordinates: Coordinate[]) => {
    if (selectedExampleImageIndex === null || !config.metadata?.fewShot) return;

    const updatedExamples = [...config.metadata.fewShot.exampleImages];
    updatedExamples[selectedExampleImageIndex] = {
      ...updatedExamples[selectedExampleImageIndex],
      coordinates,
    };

    onUpdate({
      ...config,
      metadata: {
        ...config.metadata,
        fewShot: {
          ...config.metadata.fewShot,
          exampleImages: updatedExamples,
        },
      },
    });
  };

  const handleNavigateMarkerSheet = (direction: 'next' | 'prev') => {
    if (selectedExampleImageIndex === null || !config.metadata?.fewShot) return;

    const exampleCount = config.metadata.fewShot.exampleImages.length;
    if (direction === 'next' && selectedExampleImageIndex < exampleCount - 1) {
      setSelectedExampleImageIndex(selectedExampleImageIndex + 1);
    } else if (direction === 'prev' && selectedExampleImageIndex > 0) {
      setSelectedExampleImageIndex(selectedExampleImageIndex - 1);
    }
  };

  const selectedTechnique = TECHNIQUES.find((t) => t.id === config.technique);

  const canSubmitCard = () => {
    if (config.technique === "standard") {
      return config.prompt.length > 0 && config.assignedImages.length > 0;
    }

    if (config.technique === "few-shot" && config.metadata?.fewShot) {
      const { targetImage, exampleImages } = config.metadata.fewShot;
      return (
        config.prompt.length > 0 &&
        targetImage !== undefined &&
        targetImage !== null &&
        exampleImages.length > 0 &&
        exampleImages.every(img => img.coordinates.length > 0)
      );
    }

    if (config.technique === "visual-pointing" && config.metadata?.visualPointing) {
      return (
        config.metadata.visualPointing.imageId !== null &&
        config.metadata.visualPointing.markups.length > 0
      );
    }

    if (config.technique === "multi-image" && config.metadata?.multiImage) {
      return (
        config.metadata.multiImage.targetImageId !== null &&
        config.metadata.multiImage.referenceImageIds.length > 0
      );
    }

    return false;
  };

  const handleSubmitCard = () => {
    if (!canSubmitCard()) return;
    console.log(JSON.stringify({ action: "submit-card", config }, null, 0));
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <svg
            className={cn(
              "w-5 h-5 text-gray-500 transition-transform duration-200",
              isExpanded ? "rotate-90" : ""
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2 flex-1">
          <select
            value={config.technique}
            onChange={(e) => handleTechniqueChange(e.target.value as TechniqueType)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-medium"
          >
            {TECHNIQUES.map((technique) => (
              <option key={technique.id} value={technique.id}>
                {technique.name}
              </option>
            ))}
          </select>

          {selectedTechnique?.hasSubCategories && (
            <select
              value={config.selectedSubCategory || ""}
              onChange={(e) => handleSubCategoryChange(e.target.value as FewShotSubCategory)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">Select sub-category...</option>
              {SUB_CATEGORIES.map((subCat) => (
                <option key={subCat.id} value={subCat.id}>
                  {subCat.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={onDelete}
          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded flex-shrink-0"
          title="Delete card"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <>
          {config.technique === "few-shot" && config.metadata?.fewShot ? (
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt
                    </label>
                    <textarea
                      value={config.prompt}
                      onChange={(e) => handlePromptChange(e.target.value)}
                      placeholder="Enter your prompt here..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      {config.prompt.length} characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Image
                    </label>
                    <DropZone
                      onImagesUploaded={handleTargetImageUpload}
                      uploadedImages={config.metadata.fewShot.targetImage ? [config.metadata.fewShot.targetImage] : []}
                      onRemoveImage={handleRemoveTargetImage}
                      onReorderImages={() => {}}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Example Images (up to 4)
                  </label>
                  <DropZone
                    onImagesUploaded={handleExampleImagesUpload}
                    uploadedImages={config.metadata.fewShot.exampleImages}
                    onRemoveImage={handleRemoveExampleImage}
                    onReorderImages={() => {}}
                  />

                  {config.metadata.fewShot.exampleImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {config.metadata.fewShot.exampleImages.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => handleOpenMarkerSheet(index)}
                          className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all"
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
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 divide-x divide-gray-200">
              <div className="p-6 space-y-4">
                {config.technique === "standard" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Images ({config.assignedImages.length})
                    </label>
                    {uploadedImages.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No images uploaded yet</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {uploadedImages.map((image) => (
                          <button
                            key={image.id}
                            onClick={() => handleImageSelect(image.id)}
                            className={cn(
                              "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                              config.assignedImages.includes(image.id)
                                ? "border-blue-500 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-gray-300"
                            )}
                          >
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-full h-full object-cover"
                            />
                            {config.assignedImages.includes(image.id) && (
                              <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-blue-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6">
                {config.technique === "standard" && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt
                    </label>
                    <textarea
                      value={config.prompt}
                      onChange={(e) => handlePromptChange(e.target.value)}
                      placeholder="Enter your prompt here..."
                      rows={12}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      {config.prompt.length} characters
                    </p>
                  </>
                )}

                {config.technique === "visual-pointing" && config.metadata?.visualPointing && (
                  <VisualPointingEditor
                    config={config.metadata.visualPointing}
                    onChange={handleVisualPointingChange}
                    uploadedImages={uploadedImages}
                  />
                )}

                {config.technique === "multi-image" && config.metadata?.multiImage && (
                  <MultiImageBuilder
                    config={config.metadata.multiImage}
                    onChange={handleMultiImageChange}
                    uploadedImages={uploadedImages}
                  />
                )}
              </div>
            </div>
          )}

          {config.technique === "few-shot" && config.metadata?.fewShot && selectedExampleImageIndex !== null && (
            <ImageMarkerSheet
              isOpen={markerSheetOpen}
              onClose={() => {
                setMarkerSheetOpen(false);
                setSelectedExampleImageIndex(null);
              }}
              image={config.metadata.fewShot.exampleImages[selectedExampleImageIndex]}
              initialCoordinates={config.metadata.fewShot.exampleImages[selectedExampleImageIndex].coordinates}
              onSave={handleSaveMarkers}
              onNavigate={config.metadata.fewShot.exampleImages.length > 1 ? handleNavigateMarkerSheet : undefined}
              currentIndex={selectedExampleImageIndex}
              totalImages={config.metadata.fewShot.exampleImages.length}
            />
          )}
        </>
      )}

      <div className="p-3 border-t border-gray-200 flex justify-between items-center">
        <button
          onClick={onAddBelow}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Insert card below"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Insert Card Below</span>
        </button>

        <button
          onClick={handleSubmitCard}
          disabled={!canSubmitCard()}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
            canSubmitCard()
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
          title={canSubmitCard() ? "Submit this prompt" : "Complete all required fields"}
        >
          <span>Submit single prompt</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}