export interface ProcessedResponse {
  text: string;
  structuredData: Record<string, unknown> | null;
  codeBlocks: CodeBlock[];
  confidence: ConfidenceLevel;
  summary: string;
  keyFindings: string[];
}

export interface CodeBlock {
  language: string;
  code: string;
  startLine: number;
  endLine: number;
}

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown';

export function parseResponse(rawResponse: string): ProcessedResponse {
  const text = rawResponse.trim();
  const structuredData = extractStructuredData(text);
  const codeBlocks = extractCodeBlocks(text);
  const confidence = parseConfidence(text);
  const summary = generateSummary(text);
  const keyFindings = extractKeyFindings(text);

  return {
    text,
    structuredData,
    codeBlocks,
    confidence,
    summary,
    keyFindings,
  };
}

export function extractStructuredData(text: string): Record<string, unknown> | null {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      return null;
    }
  }

  const codeBlockMatch = text.match(/```\n(\{[\s\S]*?\}|\[[\s\S]*?\])\n```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1]);
    } catch {
      return null;
    }
  }

  try {
    const jsonObjectMatch = text.match(/\{[\s\S]*"[\s\S]*":[\s\S]*\}/);
    if (jsonObjectMatch) {
      return JSON.parse(jsonObjectMatch[0]);
    }
  } catch {
    return null;
  }

  return null;
}

export function extractCodeBlocks(text: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)\n```/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const language = match[1] || 'text';
    const code = match[2];
    const startLine = text.substring(0, match.index).split('\n').length;
    const endLine = startLine + code.split('\n').length - 1;

    blocks.push({
      language,
      code,
      startLine,
      endLine,
    });
  }

  return blocks;
}

export function validateResponseFormat(
  response: string,
  expectedFormat?: 'json' | 'text' | 'structured'
): boolean {
  if (!expectedFormat) return true;

  switch (expectedFormat) {
    case 'json':
      return extractStructuredData(response) !== null;
    case 'structured':
      return extractStructuredData(response) !== null || extractCodeBlocks(response).length > 0;
    case 'text':
      return response.length > 0;
    default:
      return true;
  }
}

export function formatCodeBlocks(text: string): string {
  return text.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
    const language = lang || 'text';
    return `<pre class="code-block" data-language="${language}"><code>${escapeHtml(code)}</code></pre>`;
  });
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function handleStreamingUpdate(
  currentText: string,
  newChunk: string
): string {
  return currentText + newChunk;
}

export function recoverFromError(error: unknown): ProcessedResponse {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

  return {
    text: `Error: ${errorMessage}`,
    structuredData: null,
    codeBlocks: [],
    confidence: 'unknown',
    summary: 'Response processing failed',
    keyFindings: [],
  };
}

export function generateSummary(text: string): string {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  if (sentences.length === 0) return '';
  if (sentences.length <= 2) return text.trim();

  const firstSentences = sentences.slice(0, 2).join('. ').trim();
  return firstSentences + (firstSentences.endsWith('.') ? '' : '.');
}

export function extractKeyFindings(text: string): string[] {
  const findings: string[] = [];

  const bulletMatch = text.match(/^[\s]*[-*•]\s+(.+)$/gm);
  if (bulletMatch) {
    findings.push(...bulletMatch.map((m) => m.replace(/^[\s]*[-*•]\s+/, '').trim()));
  }

  const numberedMatch = text.match(/^[\s]*\d+\.\s+(.+)$/gm);
  if (numberedMatch) {
    findings.push(...numberedMatch.map((m) => m.replace(/^[\s]*\d+\.\s+/, '').trim()));
  }

  if (findings.length === 0) {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
    findings.push(...sentences.slice(0, 3).map((s) => s.trim()));
  }

  return findings.slice(0, 5);
}

export function parseConfidence(text: string): ConfidenceLevel {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes('very confident') ||
    lowerText.includes('highly confident') ||
    lowerText.includes('certain') ||
    lowerText.includes('definitely')
  ) {
    return 'high';
  }

  if (
    lowerText.includes('not confident') ||
    lowerText.includes('uncertain') ||
    lowerText.includes('unsure') ||
    lowerText.includes('might be') ||
    lowerText.includes('possibly') ||
    lowerText.includes('low confidence')
  ) {
    return 'low';
  }

  if (
    lowerText.includes('somewhat confident') ||
    lowerText.includes('moderately confident') ||
    lowerText.includes('likely') ||
    lowerText.includes('probably')
  ) {
    return 'medium';
  }

  const hasQualifiers = /\b(seems?|appears?|looks? like|suggests?)\b/i.test(text);
  if (hasQualifiers) {
    return 'medium';
  }

  return 'unknown';
}