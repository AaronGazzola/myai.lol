'use client';

import { TechniqueType } from '@/lib/workflowStore';

export function PromptCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white animate-pulse">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="md:w-2/3 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-40"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 rounded w-24"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ImageUploadProgress({
  files,
  progress
}: {
  files: { name: string; size: number }[];
  progress: Record<string, number>
}) {
  return (
    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="font-medium text-blue-900">Uploading {files.length} {files.length === 1 ? 'image' : 'images'}...</span>
      </div>
      <div className="space-y-2">
        {files.map((file, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-sm text-blue-800">
              <span className="truncate max-w-[200px]">{file.name}</span>
              <span>{progress[file.name] || 0}%</span>
            </div>
            <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress[file.name] || 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResponseStreamingLoader({
  technique
}: {
  technique: TechniqueType
}) {
  const messages: Record<TechniqueType, string> = {
    'standard': 'Analyzing image...',
    'few-shot': 'Learning from examples...',
    'multi-step': 'Processing step by step...',
    'visual-pointing': 'Examining marked regions...',
    'multi-image': 'Comparing images...'
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 bg-white">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-gray-700">Processing</span>
          </div>
        </div>
        <div className="md:w-2/3">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-gray-600">{messages[technique]}</span>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-5/6"></div>
              <div className="h-4 bg-gray-100 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WorkflowProgressBar({
  current,
  total,
  currentCardName
}: {
  current: number;
  total: number;
  currentCardName?: string
}) {
  const percentage = (current / total) * 100;

  return (
    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium text-purple-900">
            Processing Workflow {current}/{total}
          </span>
          <span className="text-sm text-purple-700">{Math.round(percentage)}%</span>
        </div>
        {currentCardName && (
          <div className="text-sm text-purple-800 flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <span>{currentCardName}</span>
          </div>
        )}
        <div className="h-3 bg-purple-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-1.5 rounded-full ${
                idx < current ? 'bg-purple-500' : idx === current ? 'bg-purple-300 animate-pulse' : 'bg-purple-100'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TechniqueProcessingIndicator({
  technique,
  step
}: {
  technique: TechniqueType;
  step?: string
}) {
  const icons: Record<TechniqueType, string> = {
    'standard': '🔍',
    'few-shot': '📚',
    'multi-step': '🪜',
    'visual-pointing': '📍',
    'multi-image': '🖼️'
  };

  const labels: Record<TechniqueType, string> = {
    'standard': 'Standard Analysis',
    'few-shot': 'Few-Shot Learning',
    'multi-step': 'Multi-Step Reasoning',
    'visual-pointing': 'Visual Pointing',
    'multi-image': 'Multi-Image Context'
  };

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
      <span className="text-lg">{icons[technique]}</span>
      <span className="text-sm font-medium text-gray-700">{labels[technique]}</span>
      {step && (
        <>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-600">{step}</span>
        </>
      )}
      <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin ml-1"></div>
    </div>
  );
}

export function FullPageLoader({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        {message && (
          <p className="text-gray-700 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}

export function SpinnerIcon({ className }: { className?: string }) {
  return (
    <div className={`border-2 border-current border-t-transparent rounded-full animate-spin ${className || 'w-4 h-4'}`}></div>
  );
}