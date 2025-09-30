"use client";

import { SUPPORTED_MODELS } from "@/lib/openrouter";
import { useState } from "react";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentModel = SUPPORTED_MODELS[selectedModel as keyof typeof SUPPORTED_MODELS];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        AI Model
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">{currentModel?.name || "Select Model"}</div>
            <div className="text-sm text-gray-500">{currentModel?.description}</div>
          </div>
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg">
          {Object.entries(SUPPORTED_MODELS).map(([modelId, model]) => (
            <button
              key={modelId}
              type="button"
              onClick={() => {
                onModelChange(modelId);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                selectedModel === modelId ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-sm text-gray-500">{model.description}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Max images: {model.maxImages} • Cost: {model.cost}
                  </div>
                </div>
                {selectedModel === modelId && (
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}