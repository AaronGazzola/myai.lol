'use client';

import { useState } from 'react';
import { TechniqueType, PromptCard } from '@/lib/workflowStore';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'counting' | 'identification' | 'analysis' | 'comparison';
  cards: Omit<PromptCard, 'id' | 'response'>[];
  tags: string[];
}

const BUILTIN_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'object-counting',
    name: 'Object Counting Workflow',
    description: 'Systematically count objects in images using few-shot learning and multi-step verification',
    category: 'counting',
    tags: ['counting', 'verification', 'accuracy'],
    cards: [
      {
        technique: 'few-shot',
        config: {
          examples: [],
          target: null,
          description: 'Provide 2-3 examples of images with object counts, then select your target image'
        },
        assignedImages: []
      },
      {
        technique: 'multi-step',
        config: {
          steps: [
            'First, identify all [objects] visible in the image',
            'For each [object], count the total instances',
            'List each location and its [object] count',
            'Provide the total sum',
            'Double-check your count and verify the total'
          ]
        },
        assignedImages: []
      }
    ]
  },
  {
    id: 'comparative-analysis',
    name: 'Comparative Analysis Workflow',
    description: 'Compare multiple images and identify similarities, differences, and patterns',
    category: 'comparison',
    tags: ['comparison', 'analysis', 'multi-image'],
    cards: [
      {
        technique: 'multi-image',
        config: {
          references: [],
          target: null,
          relationshipType: 'comparison',
          contextDescription: 'Compare these images and identify key similarities and differences'
        },
        assignedImages: []
      },
      {
        technique: 'multi-step',
        config: {
          steps: [
            'Identify the main elements present in each image',
            'Compare the common elements across all images',
            'Note the unique elements in each image',
            'Identify patterns or trends',
            'Provide a comprehensive comparison summary'
          ]
        },
        assignedImages: []
      }
    ]
  },
  {
    id: 'detailed-inspection',
    name: 'Detailed Inspection Workflow',
    description: 'Deep dive into specific regions of an image with visual pointing and systematic analysis',
    category: 'analysis',
    tags: ['inspection', 'visual-pointing', 'detailed'],
    cards: [
      {
        technique: 'visual-pointing',
        config: {
          image: null,
          markup: [],
          prompt: 'Mark the regions you want to analyze in detail'
        },
        assignedImages: []
      },
      {
        technique: 'multi-step',
        config: {
          steps: [
            'For each marked region, describe what you observe',
            'Identify any notable features or anomalies',
            'Analyze the relationship between marked regions',
            'Provide detailed findings for each region',
            'Summarize the overall inspection results'
          ]
        },
        assignedImages: []
      }
    ]
  },
  {
    id: 'pattern-recognition',
    name: 'Pattern Recognition Workflow',
    description: 'Learn patterns from examples and apply them to new images',
    category: 'identification',
    tags: ['pattern', 'few-shot', 'learning'],
    cards: [
      {
        technique: 'few-shot',
        config: {
          examples: [],
          target: null,
          description: 'Provide examples of the pattern you want to recognize'
        },
        assignedImages: []
      },
      {
        technique: 'multi-step',
        config: {
          steps: [
            'Review the pattern learned from the examples',
            'Identify elements in the target image that match the pattern',
            'Note any variations or exceptions',
            'Classify the target image based on the learned pattern',
            'Provide confidence level for your classification'
          ]
        },
        assignedImages: []
      }
    ]
  },
  {
    id: 'reference-based-analysis',
    name: 'Reference-Based Analysis',
    description: 'Use reference images to provide context for analyzing a target image',
    category: 'analysis',
    tags: ['reference', 'context', 'comparison'],
    cards: [
      {
        technique: 'multi-image',
        config: {
          references: [],
          target: null,
          relationshipType: 'reference',
          contextDescription: 'Use the reference images as a guide for analyzing the target'
        },
        assignedImages: []
      },
      {
        technique: 'standard',
        config: {
          prompt: 'Based on the reference context, provide a detailed analysis of the target image. Highlight similarities and differences.'
        },
        assignedImages: []
      }
    ]
  },
  {
    id: 'comprehensive-evaluation',
    name: 'Comprehensive Evaluation',
    description: 'Multi-step comprehensive evaluation with visual guidance and verification',
    category: 'analysis',
    tags: ['comprehensive', 'thorough', 'multi-step'],
    cards: [
      {
        technique: 'visual-pointing',
        config: {
          image: null,
          markup: [],
          prompt: 'Mark all areas that require evaluation'
        },
        assignedImages: []
      },
      {
        technique: 'multi-step',
        config: {
          steps: [
            'Provide an initial overview of the entire image',
            'For each marked region, perform detailed analysis',
            'Identify relationships between different regions',
            'Assess overall quality and completeness',
            'Provide final evaluation with recommendations'
          ]
        },
        assignedImages: []
      },
      {
        technique: 'standard',
        config: {
          prompt: 'Review all previous findings and provide a final comprehensive summary with confidence ratings'
        },
        assignedImages: []
      }
    ]
  }
];

export function WorkflowTemplates({
  onApplyTemplate
}: {
  onApplyTemplate: (template: WorkflowTemplate) => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null);

  const categories = [
    { id: 'all', label: 'All Templates', icon: '📋' },
    { id: 'counting', label: 'Counting', icon: '🔢' },
    { id: 'identification', label: 'Identification', icon: '🔍' },
    { id: 'analysis', label: 'Analysis', icon: '📊' },
    { id: 'comparison', label: 'Comparison', icon: '⚖️' }
  ];

  const filteredTemplates = selectedCategory && selectedCategory !== 'all'
    ? BUILTIN_TEMPLATES.filter(t => t.category === selectedCategory)
    : BUILTIN_TEMPLATES;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id === 'all' ? null : cat.id)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 transition-colors ${
              (cat.id === 'all' && !selectedCategory) || selectedCategory === cat.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{cat.icon}</span>
            <span className="text-sm font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>

              <div className="flex flex-wrap gap-1">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="text-sm text-gray-500">
                {template.cards.length} {template.cards.length === 1 ? 'card' : 'cards'}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Preview
                </button>
                <button
                  onClick={() => onApplyTemplate(template)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{previewTemplate.name}</h2>
                  <p className="text-gray-600 mt-1">{previewTemplate.description}</p>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Workflow Steps:</h3>
                {previewTemplate.cards.map((card, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-900 capitalize">
                        {card.technique.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 ml-8">
                      {card.technique === 'multi-step' && (
                        <ul className="list-disc list-inside space-y-1">
                          {(card.config.steps as string[]).map((step, stepIdx) => (
                            <li key={stepIdx}>{step}</li>
                          ))}
                        </ul>
                      )}
                      {card.technique === 'few-shot' && (
                        <p>Configure with example images and target</p>
                      )}
                      {card.technique === 'visual-pointing' && (
                        <p>Mark regions of interest on the image</p>
                      )}
                      {card.technique === 'multi-image' && (
                        <p>{card.config.contextDescription}</p>
                      )}
                      {card.technique === 'standard' && (
                        <p>{card.config.prompt}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onApplyTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
                >
                  Apply Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}