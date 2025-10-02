"use client";

import { useState } from "react";
import { cn } from "@/lib/shadcn.utils";
import FewShotBuilder, { FewShotConfig } from "./FewShotBuilder";
import MultiStepBuilder, { MultiStepConfig } from "./MultiStepBuilder";
import VisualPointingEditor, { VisualPointingConfig } from "./VisualPointingEditor";
import MultiImageBuilder, { MultiImageConfig } from "./MultiImageBuilder";

export type TechniqueType =
  | "standard"
  | "few-shot"
  | "multi-step"
  | "visual-pointing"
  | "multi-image";

export interface PromptCardConfig {
  id: string;
  technique: TechniqueType;
  prompt: string;
  assignedImages: string[];
  metadata?: {
    fewShot?: FewShotConfig;
    multiStep?: MultiStepConfig;
    visualPointing?: VisualPointingConfig;
    multiImage?: MultiImageConfig;
  };
}

interface PromptCardProps {
  config: PromptCardConfig;
  onUpdate: (config: PromptCardConfig) => void;
  onAddAbove: () => void;
  onAddBelow: () => void;
  onDelete: () => void;
  uploadedImages: Array<{ id: string; preview: string; name: string }>;
}

const TECHNIQUES = [
  {
    id: "standard" as TechniqueType,
    name: "Standard Prompt",
    description: "Single image with text prompt",
  },
  {
    id: "few-shot" as TechniqueType,
    name: "Few-Shot Learning",
    description: "Examples with labels + target image",
  },
  {
    id: "multi-step" as TechniqueType,
    name: "Multi-Step Prompting",
    description: "Sequential analysis steps",
  },
  {
    id: "visual-pointing" as TechniqueType,
    name: "Visual Pointing",
    description: "Markup regions on image",
  },
  {
    id: "multi-image" as TechniqueType,
    name: "Multi-Image Context",
    description: "Reference images + target",
  },
];

export default function PromptCard({
  config,
  onUpdate,
  onAddAbove,
  onAddBelow,
  onDelete,
  uploadedImages,
}: PromptCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleTechniqueChange = (technique: TechniqueType) => {
    const newConfig = { ...config, technique };

    if (technique === "few-shot" && !config.metadata?.fewShot) {
      newConfig.metadata = {
        ...config.metadata,
        fewShot: { targetImageId: null, exampleImages: [], selectedTemplate: null },
      };
    } else if (technique === "multi-step" && !config.metadata?.multiStep) {
      newConfig.metadata = {
        ...config.metadata,
        multiStep: { steps: [] },
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

  const handlePromptChange = (prompt: string) => {
    onUpdate({ ...config, prompt });
  };

  const handleImageSelect = (imageId: string) => {
    const assigned = config.assignedImages.includes(imageId)
      ? config.assignedImages.filter((id) => id !== imageId)
      : [...config.assignedImages, imageId];
    onUpdate({ ...config, assignedImages: assigned });
  };

  const handleFewShotChange = (fewShotConfig: FewShotConfig) => {
    onUpdate({
      ...config,
      metadata: { ...config.metadata, fewShot: fewShotConfig },
    });
  };

  const handleMultiStepChange = (multiStepConfig: MultiStepConfig) => {
    onUpdate({
      ...config,
      metadata: { ...config.metadata, multiStep: multiStepConfig },
    });
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

  const selectedTechnique = TECHNIQUES.find((t) => t.id === config.technique);

  return (
    <div className="border-2 border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left flex-1"
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
          <div>
            <h3 className="font-medium text-gray-900">{selectedTechnique?.name}</h3>
            <p className="text-xs text-gray-500">{selectedTechnique?.description}</p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onAddAbove}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Add card above"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <button
            onClick={onAddBelow}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="Add card below"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
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
      </div>

      {isExpanded && (
        <div className="grid md:grid-cols-2 divide-x divide-gray-200">
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Technique
              </label>
              <select
                value={config.technique}
                onChange={(e) => handleTechniqueChange(e.target.value as TechniqueType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {TECHNIQUES.map((technique) => (
                  <option key={technique.id} value={technique.id}>
                    {technique.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {selectedTechnique?.description}
              </p>
            </div>

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

            {config.technique === "few-shot" && config.metadata?.fewShot && (
              <FewShotBuilder
                config={config.metadata.fewShot}
                onChange={handleFewShotChange}
              />
            )}

            {config.technique === "multi-step" && config.metadata?.multiStep && (
              <MultiStepBuilder
                config={config.metadata.multiStep}
                onChange={handleMultiStepChange}
              />
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
    </div>
  );
}