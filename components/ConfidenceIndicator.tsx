'use client';

import { ConfidenceLevel } from '@/lib/responseProcessor';

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel;
  explanation?: string;
}

export default function ConfidenceIndicator({
  level,
  explanation,
}: ConfidenceIndicatorProps) {
  const config = getConfidenceConfig(level);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div className={`h-2 w-2 rounded-full ${config.dotColor}`} />
        <span className={`text-sm font-medium ${config.textColor}`}>
          {config.label}
        </span>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={`h-4 w-1.5 rounded-sm transition-all ${
              bar <= config.bars
                ? config.barColor
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>

      {explanation && (
        <div className="group relative">
          <svg
            className="h-4 w-4 text-gray-400 cursor-help"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
}

function getConfidenceConfig(level: ConfidenceLevel) {
  switch (level) {
    case 'high':
      return {
        label: 'High Confidence',
        bars: 3,
        dotColor: 'bg-green-500',
        textColor: 'text-green-700 dark:text-green-400',
        barColor: 'bg-green-500',
      };
    case 'medium':
      return {
        label: 'Medium Confidence',
        bars: 2,
        dotColor: 'bg-yellow-500',
        textColor: 'text-yellow-700 dark:text-yellow-400',
        barColor: 'bg-yellow-500',
      };
    case 'low':
      return {
        label: 'Low Confidence',
        bars: 1,
        dotColor: 'bg-red-500',
        textColor: 'text-red-700 dark:text-red-400',
        barColor: 'bg-red-500',
      };
    case 'unknown':
    default:
      return {
        label: 'Unknown',
        bars: 0,
        dotColor: 'bg-gray-400',
        textColor: 'text-gray-600 dark:text-gray-400',
        barColor: 'bg-gray-400',
      };
  }
}