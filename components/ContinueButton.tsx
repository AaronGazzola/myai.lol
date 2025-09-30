'use client';

import { useState } from 'react';
import { ProcessedResponse } from '@/lib/responseProcessor';

export type ContextMode = 'full' | 'summary' | 'structured' | 'custom';

interface ContinueButtonProps {
  response: ProcessedResponse;
  onContinue: (context: string, mode: ContextMode) => void;
  currentIndex: number;
  totalCards: number;
  disabled?: boolean;
}

export default function ContinueButton({
  response,
  onContinue,
  currentIndex,
  totalCards,
  disabled = false,
}: ContinueButtonProps) {
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ContextMode>('summary');
  const [customContext, setCustomContext] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const extractContext = (mode: ContextMode): string => {
    switch (mode) {
      case 'full':
        return response.text;
      case 'summary':
        return response.summary || response.text.substring(0, 200);
      case 'structured':
        return response.structuredData
          ? JSON.stringify(response.structuredData, null, 2)
          : response.text;
      case 'custom':
        return customContext;
      default:
        return response.summary || response.text;
    }
  };

  const handleContinue = () => {
    if (selectedMode === 'custom' && !customContext.trim()) {
      setShowCustomInput(true);
      return;
    }

    const context = extractContext(selectedMode);
    onContinue(context, selectedMode);
    setShowModeSelector(false);
    setShowCustomInput(false);
  };

  const getPreviewText = (mode: ContextMode): string => {
    const context = extractContext(mode);
    return context.length > 100 ? context.substring(0, 100) + '...' : context;
  };

  const isLastCard = currentIndex >= totalCards - 1;

  if (isLastCard) {
    return null;
  }

  return (
    <div className="w-full mt-4">
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Continue to next prompt
            </div>
            <div className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-medium rounded">
              {currentIndex + 1} of {totalCards}
            </div>
          </div>

          <button
            onClick={() => setShowModeSelector(!showModeSelector)}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
          >
            Context options
            <svg
              className={`h-4 w-4 transition-transform ${showModeSelector ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {showModeSelector && (
          <div className="mb-4 space-y-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-2">
              Select context to pass:
            </label>

            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="contextMode"
                  value="summary"
                  checked={selectedMode === 'summary'}
                  onChange={(e) => setSelectedMode(e.target.value as ContextMode)}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Summary
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Key findings only
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="contextMode"
                  value="full"
                  checked={selectedMode === 'full'}
                  onChange={(e) => setSelectedMode(e.target.value as ContextMode)}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Full Response
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Complete AI response
                  </div>
                </div>
              </label>

              {response.structuredData && (
                <label className="flex items-start gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="contextMode"
                    value="structured"
                    checked={selectedMode === 'structured'}
                    onChange={(e) => setSelectedMode(e.target.value as ContextMode)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Structured Data
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      JSON data only
                    </div>
                  </div>
                </label>
              )}

              <label className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="contextMode"
                  value="custom"
                  checked={selectedMode === 'custom'}
                  onChange={(e) => {
                    setSelectedMode(e.target.value as ContextMode);
                    setShowCustomInput(true);
                  }}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Custom
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Enter custom context
                  </div>
                </div>
              </label>

              {showCustomInput && selectedMode === 'custom' && (
                <textarea
                  value={customContext}
                  onChange={(e) => setCustomContext(e.target.value)}
                  placeholder="Enter custom context to pass..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              )}
            </div>

            {selectedMode !== 'custom' && (
              <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Preview:
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-300 italic">
                  {getPreviewText(selectedMode)}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleContinue}
            disabled={disabled}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Continue with {selectedMode} context
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>

          <button
            onClick={() => onContinue('', 'summary')}
            disabled={disabled}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            title="Skip to next prompt without context"
          >
            Skip
          </button>
        </div>

        <div className="mt-3 flex items-center justify-center gap-1">
          {Array.from({ length: totalCards }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx <= currentIndex
                  ? 'bg-blue-600 w-6'
                  : 'bg-gray-300 dark:bg-gray-600 w-4'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}