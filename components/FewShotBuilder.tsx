"use client";

import { useState } from "react";
import { cn } from "@/lib/shadcn.utils";

export interface FewShotExample {
  id: string;
  imageId: string;
  label: string;
}

export interface FewShotConfig {
  examples: FewShotExample[];
  targetImageId: string | null;
}

interface FewShotBuilderProps {
  config: FewShotConfig;
  onChange: (config: FewShotConfig) => void;
  uploadedImages: Array<{ id: string; preview: string; name: string }>;
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
  uploadedImages,
}: FewShotBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const addExample = () => {
    const newExample: FewShotExample = {
      id: `example-${Date.now()}-${Math.random()}`,
      imageId: "",
      label: "",
    };
    onChange({
      ...config,
      examples: [...config.examples, newExample],
    });
  };

  const removeExample = (id: string) => {
    onChange({
      ...config,
      examples: config.examples.filter((ex) => ex.id !== id),
    });
  };

  const updateExample = (id: string, field: keyof FewShotExample, value: string) => {
    onChange({
      ...config,
      examples: config.examples.map((ex) =>
        ex.id === id ? { ...ex, [field]: value } : ex
      ),
    });
  };

  const setTargetImage = (imageId: string) => {
    onChange({
      ...config,
      targetImageId: config.targetImageId === imageId ? null : imageId,
    });
  };

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    const updatedExamples = config.examples.map((ex) => ({
      ...ex,
      label: ex.label || template.exampleFormat,
    }));

    onChange({
      ...config,
      examples: updatedExamples,
    });
  };

  const getImageById = (id: string) => {
    return uploadedImages.find((img) => img.id === id);
  };

  const availableImages = uploadedImages.filter(
    (img) =>
      !config.examples.some((ex) => ex.imageId === img.id) &&
      config.targetImageId !== img.id
  );

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Few-Shot Learning</h4>
        <p className="text-sm text-blue-700">
          Provide 2-5 example images with labeled outputs to teach the AI the pattern
          before analyzing a target image.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template (Optional)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => applyTemplate(template.id)}
              className={cn(
                "p-3 border-2 rounded-lg text-left transition-all duration-200",
                selectedTemplate === template.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="font-medium text-sm text-gray-900">{template.name}</div>
              <div className="text-xs text-gray-500 mt-1">{template.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Examples ({config.examples.length})
          </label>
          <button
            onClick={addExample}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Example
          </button>
        </div>

        {config.examples.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">No examples yet. Add your first example above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {config.examples.map((example, index) => {
              const image = getImageById(example.imageId);
              return (
                <div
                  key={example.id}
                  className="border border-gray-200 rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        Example {index + 1}
                      </div>
                      {image ? (
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-24 h-24 object-cover rounded border border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Select Image
                        </label>
                        <select
                          value={example.imageId}
                          onChange={(e) =>
                            updateExample(example.id, "imageId", e.target.value)
                          }
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Choose an image...</option>
                          {example.imageId && image && (
                            <option value={example.imageId}>{image.name}</option>
                          )}
                          {availableImages.map((img) => (
                            <option key={img.id} value={img.id}>
                              {img.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Label / Description
                        </label>
                        <input
                          type="text"
                          value={example.label}
                          onChange={(e) =>
                            updateExample(example.id, "label", e.target.value)
                          }
                          placeholder="e.g., Contains 3 toilets"
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeExample(example.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg
                        className="w-5 h-5"
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
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Target Image
        </label>
        {uploadedImages.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No images uploaded yet</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {uploadedImages
              .filter((img) => !config.examples.some((ex) => ex.imageId === img.id))
              .map((image) => (
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

      {config.examples.length > 0 && config.targetImageId && (
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
              Configuration complete! {config.examples.length} examples with 1 target image.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}