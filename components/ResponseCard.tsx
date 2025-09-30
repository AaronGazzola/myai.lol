'use client';

import { useState } from 'react';
import { ProcessedResponse } from '@/lib/responseProcessor';
import ConfidenceIndicator from './ConfidenceIndicator';

interface ResponseCardProps {
  response: ProcessedResponse;
  technique: string;
  techniqueConfig?: Record<string, unknown>;
  onContinue?: (context: string) => void;
}

export default function ResponseCard({
  response,
  technique,
  techniqueConfig,
  onContinue,
}: ResponseCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(response.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportResponse = (format: 'txt' | 'json' | 'md') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(
          {
            technique,
            response: response.text,
            structuredData: response.structuredData,
            confidence: response.confidence,
            summary: response.summary,
            keyFindings: response.keyFindings,
          },
          null,
          2
        );
        filename = 'response.json';
        mimeType = 'application/json';
        break;
      case 'md':
        content = `# AI Response\n\n**Technique:** ${technique}\n\n**Confidence:** ${response.confidence}\n\n## Summary\n\n${response.summary}\n\n## Key Findings\n\n${response.keyFindings.map((f) => `- ${f}`).join('\n')}\n\n## Full Response\n\n${response.text}`;
        filename = 'response.md';
        mimeType = 'text/markdown';
        break;
      case 'txt':
      default:
        content = response.text;
        filename = 'response.txt';
        mimeType = 'text/plain';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr]">
        <div className="border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Technique Used
              </h3>
              <div className="px-3 py-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {technique}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Confidence Level
              </h3>
              <div className="px-3 py-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                <ConfidenceIndicator
                  level={response.confidence}
                  explanation="Confidence level based on AI response indicators"
                />
              </div>
            </div>

            {response.summary && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Summary
                </h3>
                <div className="px-3 py-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {response.summary}
                  </p>
                </div>
              </div>
            )}

            {response.keyFindings.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Key Findings
                </h3>
                <div className="px-3 py-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                  <ul className="space-y-1">
                    {response.keyFindings.map((finding, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-700 dark:text-gray-300 flex items-start"
                      >
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={copyToClipboard}
                  className="w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy Response'}
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => exportResponse('txt')}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    TXT
                  </button>
                  <button
                    onClick={() => exportResponse('json')}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => exportResponse('md')}
                    className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    MD
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Response
            </h2>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto">
              {response.structuredData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Structured Data
                    </h3>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                      <code>{JSON.stringify(response.structuredData, null, 2)}</code>
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Response
                    </h3>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {response.text}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {response.text}
                </div>
              )}
            </div>
          </div>

          {response.codeBlocks.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Code Blocks
              </h3>
              <div className="space-y-3">
                {response.codeBlocks.map((block, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {block.language}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        Lines {block.startLine}-{block.endLine}
                      </span>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-xs">
                      <code>{block.code}</code>
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}