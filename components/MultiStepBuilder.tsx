"use client";

import { useState, DragEvent } from "react";
import { cn } from "@/lib/shadcn.utils";

export interface AnalysisStep {
  id: string;
  instruction: string;
}

export interface MultiStepConfig {
  steps: AnalysisStep[];
}

interface MultiStepBuilderProps {
  config: MultiStepConfig;
  onChange: (config: MultiStepConfig) => void;
}

const STEP_TEMPLATES = [
  "First, identify all [objects] in the image",
  "For each [object], count the instances",
  "List each [location] and its [object] count",
  "Provide the total sum",
  "Double-check your count and verify",
  "Describe the visual characteristics of [element]",
  "Compare [element A] with [element B]",
  "Explain the relationship between [element A] and [element B]",
];

export default function MultiStepBuilder({ config, onChange }: MultiStepBuilderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addStep = (position?: number) => {
    const newStep: AnalysisStep = {
      id: `step-${Date.now()}-${Math.random()}`,
      instruction: "",
    };

    const steps = [...config.steps];
    if (position !== undefined) {
      steps.splice(position + 1, 0, newStep);
    } else {
      steps.push(newStep);
    }

    onChange({ steps });
  };

  const removeStep = (id: string) => {
    onChange({
      steps: config.steps.filter((step) => step.id !== id),
    });
  };

  const updateStep = (id: string, instruction: string) => {
    onChange({
      steps: config.steps.map((step) =>
        step.id === id ? { ...step, instruction } : step
      ),
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const steps = [...config.steps];
      const [removed] = steps.splice(draggedIndex, 1);
      steps.splice(dropIndex, 0, removed);
      onChange({ steps });
    }
    setDraggedIndex(null);
  };

  const applyTemplate = (stepId: string, template: string) => {
    updateStep(stepId, template);
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-medium text-purple-900 mb-2">Multi-Step Prompting</h4>
        <p className="text-sm text-purple-700">
          Break down complex analysis into sequential steps for improved accuracy and
          chain-of-thought reasoning.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            Analysis Steps ({config.steps.length})
          </label>
          <button
            onClick={() => addStep()}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            + Add Step
          </button>
        </div>

        {config.steps.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-3">
              No steps yet. Add your first analysis step above.
            </p>
            <button
              onClick={() => addStep()}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              + Add First Step
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {config.steps.map((step, index) => (
              <div
                key={step.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e)}
                onDrop={(e) => handleDrop(e, index)}
                className={cn(
                  "border border-gray-200 rounded-lg bg-white transition-all duration-200",
                  draggedIndex === index ? "opacity-50 scale-95" : ""
                )}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      className="cursor-move p-1 text-gray-400 hover:text-gray-600 mt-1"
                      title="Drag to reorder"
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
                          d="M4 8h16M4 16h16"
                        />
                      </svg>
                    </button>

                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-medium text-sm">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      <textarea
                        value={step.instruction}
                        onChange={(e) => updateStep(step.id, e.target.value)}
                        placeholder={`Step ${index + 1}: Enter instruction...`}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />

                      {!step.instruction && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">
                            Quick templates:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {STEP_TEMPLATES.slice(0, 4).map((template, i) => (
                              <button
                                key={i}
                                onClick={() => applyTemplate(step.id, template)}
                                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                              >
                                {template.length > 30
                                  ? template.substring(0, 30) + "..."
                                  : template}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => addStep(index)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                        title="Add step below"
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeStep(step.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Remove step"
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h5 className="text-sm font-medium text-gray-900 mb-2">
          All Step Templates
        </h5>
        <div className="grid grid-cols-2 gap-2">
          {STEP_TEMPLATES.map((template, i) => (
            <button
              key={i}
              onClick={() => {
                if (config.steps.length > 0) {
                  applyTemplate(config.steps[config.steps.length - 1].id, template);
                } else {
                  addStep();
                  setTimeout(() => {
                    if (config.steps.length > 0) {
                      applyTemplate(config.steps[0].id, template);
                    }
                  }, 0);
                }
              }}
              className="text-xs px-3 py-2 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 text-gray-700 hover:text-purple-700 rounded text-left transition-all"
            >
              {template}
            </button>
          ))}
        </div>
      </div>

      {config.steps.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-purple-700">
              {config.steps.length} step{config.steps.length !== 1 ? "s" : ""}{" "}
              configured. The AI will follow these steps sequentially.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}