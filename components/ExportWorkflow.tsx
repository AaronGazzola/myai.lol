'use client';

import { useState } from 'react';
import { PromptCard } from '@/lib/workflowStore';

export type ExportFormat = 'pdf' | 'json' | 'markdown' | 'csv';

interface WorkflowExportData {
  name: string;
  cards: PromptCard[];
  createdAt: string;
}

export function ExportWorkflow({
  workflowName,
  cards,
  onClose
}: {
  workflowName: string;
  cards: PromptCard[];
  onClose: () => void;
}) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [includeResponses, setIncludeResponses] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);

  const formats: { id: ExportFormat; label: string; icon: string; description: string }[] = [
    { id: 'json', label: 'JSON', icon: '{ }', description: 'Structured data for programmatic use' },
    { id: 'markdown', label: 'Markdown', icon: '📝', description: 'Formatted text document' },
    { id: 'pdf', label: 'PDF', icon: '📄', description: 'Visual report with images' },
    { id: 'csv', label: 'CSV', icon: '📊', description: 'Tabular data for spreadsheets' }
  ];

  const exportWorkflow = async () => {
    const exportData: WorkflowExportData = {
      name: workflowName,
      cards: cards.map(card => ({
        ...card,
        response: includeResponses ? card.response : null
      })),
      createdAt: new Date().toISOString()
    };

    switch (selectedFormat) {
      case 'json':
        exportAsJSON(exportData);
        break;
      case 'markdown':
        exportAsMarkdown(exportData);
        break;
      case 'pdf':
        exportAsPDF(exportData);
        break;
      case 'csv':
        exportAsCSV(exportData);
        break;
    }

    onClose();
  };

  const exportAsJSON = (data: WorkflowExportData) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    downloadFile(blob, `${data.name}-workflow.json`);
  };

  const exportAsMarkdown = (data: WorkflowExportData) => {
    let markdown = `# ${data.name}\n\n`;
    markdown += `Generated: ${new Date(data.createdAt).toLocaleString()}\n\n`;
    markdown += `## Workflow Configuration\n\n`;
    markdown += `Total Cards: ${data.cards.length}\n\n`;

    data.cards.forEach((card, idx) => {
      markdown += `### Card ${idx + 1}: ${card.technique.replace('-', ' ').toUpperCase()}\n\n`;
      markdown += `**Configuration:**\n\n`;
      markdown += '```json\n';
      markdown += JSON.stringify(card.config, null, 2);
      markdown += '\n```\n\n';

      if (card.response && includeResponses) {
        markdown += `**Response:**\n\n`;
        markdown += card.response.text + '\n\n';
        if (card.response.confidence) {
          markdown += `**Confidence:** ${card.response.confidence}\n\n`;
        }
      }

      markdown += '---\n\n';
    });

    const blob = new Blob([markdown], { type: 'text/markdown' });
    downloadFile(blob, `${data.name}-workflow.md`);
  };

  const exportAsPDF = (data: WorkflowExportData) => {
    alert('PDF export requires server-side processing. Use JSON or Markdown export for now.');
  };

  const exportAsCSV = (data: WorkflowExportData) => {
    const headers = ['Card Number', 'Technique', 'Configuration', 'Response', 'Confidence'];
    const rows = data.cards.map((card, idx) => [
      (idx + 1).toString(),
      card.technique,
      JSON.stringify(card.config),
      includeResponses && card.response ? card.response.text.replace(/\n/g, ' ') : '',
      includeResponses && card.response?.confidence ? card.response.confidence : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    downloadFile(blob, `${data.name}-workflow.csv`);
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Export Workflow</h2>
              <p className="text-gray-600 mt-1">Choose format and options for exporting</p>
            </div>
            <button
              onClick={onClose}
              data-action="close-modal"
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              {formats.map(format => (
                <button
                  key={format.id}
                  onClick={() => setSelectedFormat(format.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    selectedFormat === format.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{format.icon}</span>
                    <span className="font-semibold text-gray-900">{format.label}</span>
                  </div>
                  <p className="text-sm text-gray-600">{format.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Export Options
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeResponses}
                onChange={(e) => setIncludeResponses(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-500 border-gray-300 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">Include AI Responses</div>
                <div className="text-sm text-gray-600">Export will include all AI analysis results</div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer opacity-50">
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                disabled
                className="mt-1 w-4 h-4 text-blue-500 border-gray-300 rounded"
              />
              <div>
                <div className="font-medium text-gray-900">Include Images</div>
                <div className="text-sm text-gray-600">Embed images in export (PDF only, coming soon)</div>
              </div>
            </label>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-700">
              <div className="font-medium mb-2">Export Summary:</div>
              <ul className="space-y-1">
                <li>• Workflow: {workflowName}</li>
                <li>• Cards: {cards.length}</li>
                <li>• Format: {formats.find(f => f.id === selectedFormat)?.label}</li>
                <li>• Responses: {includeResponses ? 'Included' : 'Excluded'}</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={exportWorkflow}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-medium"
            >
              Export {formats.find(f => f.id === selectedFormat)?.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExportButton({
  workflowName,
  cards
}: {
  workflowName: string;
  cards: PromptCard[];
}) {
  const [showExport, setShowExport] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowExport(true)}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
      >
        <span>📤</span>
        <span>Export</span>
      </button>

      {showExport && (
        <ExportWorkflow
          workflowName={workflowName}
          cards={cards}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  );
}