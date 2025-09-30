"use client";

import { cn } from "@/lib/shadcn.utils";

export type RelationshipType = "comparison" | "reference" | "example" | "context";

export interface MultiImageConfig {
  referenceImageIds: string[];
  targetImageId: string | null;
  relationshipType: RelationshipType;
  contextDescription: string;
}

interface MultiImageBuilderProps {
  config: MultiImageConfig;
  onChange: (config: MultiImageConfig) => void;
  uploadedImages: Array<{ id: string; preview: string; name: string }>;
}

const RELATIONSHIP_TYPES: Array<{
  id: RelationshipType;
  name: string;
  description: string;
  promptTemplate: string;
}> = [
  {
    id: "comparison",
    name: "Comparison",
    description: "Compare and identify differences",
    promptTemplate: "Compare these images and identify key differences",
  },
  {
    id: "reference",
    name: "Reference",
    description: "Use as reference examples",
    promptTemplate: "Use these reference images to understand what [X] looks like",
  },
  {
    id: "example",
    name: "Example",
    description: "Show typical examples",
    promptTemplate: "These images show typical examples of [Y]",
  },
  {
    id: "context",
    name: "Context",
    description: "Provide additional context",
    promptTemplate: "Given this contextual information, analyze the target image",
  },
];

export default function MultiImageBuilder({
  config,
  onChange,
  uploadedImages,
}: MultiImageBuilderProps) {
  const toggleReferenceImage = (imageId: string) => {
    const references = config.referenceImageIds.includes(imageId)
      ? config.referenceImageIds.filter((id) => id !== imageId)
      : [...config.referenceImageIds, imageId];
    onChange({ ...config, referenceImageIds: references });
  };

  const setTargetImage = (imageId: string) => {
    onChange({
      ...config,
      targetImageId: config.targetImageId === imageId ? null : imageId,
    });
  };

  const setRelationshipType = (type: RelationshipType) => {
    onChange({ ...config, relationshipType: type });
  };

  const setContextDescription = (description: string) => {
    onChange({ ...config, contextDescription: description });
  };

  const selectedRelationship = RELATIONSHIP_TYPES.find(
    (r) => r.id === config.relationshipType
  );

  const availableForTarget = uploadedImages.filter(
    (img) => !config.referenceImageIds.includes(img.id)
  );

  const availableForReference = uploadedImages.filter(
    (img) => config.targetImageId !== img.id
  );

  return (
    <div className="space-y-6">
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
        <h4 className="font-medium text-teal-900 mb-2">Multi-Image Context</h4>
        <p className="text-sm text-teal-700">
          Provide reference images alongside a target image to give the AI comparison
          context and improve understanding.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Relationship Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {RELATIONSHIP_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setRelationshipType(type.id)}
              className={cn(
                "p-4 border-2 rounded-lg text-left transition-all duration-200",
                config.relationshipType === type.id
                  ? "border-teal-500 bg-teal-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              )}
            >
              <div className="font-medium text-gray-900">{type.name}</div>
              <div className="text-xs text-gray-600 mt-1">{type.description}</div>
            </button>
          ))}
        </div>
        {selectedRelationship && (
          <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded text-sm text-gray-600">
            <strong>Prompt template:</strong> {selectedRelationship.promptTemplate}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Reference Images ({config.referenceImageIds.length})
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Select 1-3 images to provide as reference/context
        </p>
        {uploadedImages.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No images uploaded yet</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {availableForReference.map((image) => (
              <button
                key={image.id}
                onClick={() => toggleReferenceImage(image.id)}
                disabled={
                  config.referenceImageIds.length >= 3 &&
                  !config.referenceImageIds.includes(image.id)
                }
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                  config.referenceImageIds.includes(image.id)
                    ? "border-teal-500 ring-2 ring-teal-200"
                    : "border-gray-200 hover:border-gray-300",
                  config.referenceImageIds.length >= 3 &&
                    !config.referenceImageIds.includes(image.id) &&
                    "opacity-50 cursor-not-allowed"
                )}
              >
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                {config.referenceImageIds.includes(image.id) && (
                  <div className="absolute inset-0 bg-teal-500 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-teal-600 text-white text-xs font-medium px-2 py-1 rounded">
                      Ref {config.referenceImageIds.indexOf(image.id) + 1}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Target Image
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Select the image to analyze using the reference images as context
        </p>
        {availableForTarget.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No images available (all assigned as references)
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {availableForTarget.map((image) => (
              <button
                key={image.id}
                onClick={() => setTargetImage(image.id)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                  config.targetImageId === image.id
                    ? "border-green-500 ring-2 ring-green-200"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                {config.targetImageId === image.id && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                    <div className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded">
                      Target
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Context Description
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Describe the relationship between the reference and target images
        </p>
        <textarea
          value={config.contextDescription}
          onChange={(e) => setContextDescription(e.target.value)}
          placeholder={selectedRelationship?.promptTemplate || "Enter context description..."}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
        />
      </div>

      {config.referenceImageIds.length > 0 && config.targetImageId && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-teal-700">
              Configuration complete! {config.referenceImageIds.length} reference image
              {config.referenceImageIds.length !== 1 ? "s" : ""} with 1 target image using{" "}
              <strong>{selectedRelationship?.name}</strong> relationship.
            </div>
          </div>
        </div>
      )}

      {config.referenceImageIds.length > 0 &&
        config.targetImageId &&
        config.contextDescription && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Preview</h5>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Reference images:</strong> {config.referenceImageIds.length}
              </p>
              <p>
                <strong>Target image:</strong> 1
              </p>
              <p>
                <strong>Relationship:</strong> {selectedRelationship?.name}
              </p>
              <p>
                <strong>Context:</strong> {config.contextDescription}
              </p>
            </div>
          </div>
        )}
    </div>
  );
}