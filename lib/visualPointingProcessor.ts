type MarkupType = 'circle' | 'rectangle' | 'arrow' | 'text';

interface Markup {
  id: string;
  type: MarkupType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  endX?: number;
  endY?: number;
  text?: string;
  color: string;
}

interface VisualPointingConfig {
  imageId: string;
  markups: Markup[];
  prompt: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateVisualPointingConfig = (config: VisualPointingConfig): ValidationResult => {
  const errors: string[] = [];

  if (!config.imageId) {
    errors.push('Image is required for visual pointing');
  }

  if (!config.markups || config.markups.length === 0) {
    errors.push('At least one markup is required for visual pointing');
  }

  if (!config.prompt || config.prompt.trim() === '') {
    errors.push('Prompt is required for visual pointing');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const generateMarkupDescription = (markup: Markup): string => {
  switch (markup.type) {
    case 'circle':
      return `A ${markup.color} circle at position (${Math.round(markup.x)}, ${Math.round(markup.y)}) with radius ${markup.radius}`;
    case 'rectangle':
      return `A ${markup.color} rectangle at position (${Math.round(markup.x)}, ${Math.round(markup.y)}) with dimensions ${markup.width}×${markup.height}`;
    case 'arrow':
      return `A ${markup.color} arrow pointing from (${Math.round(markup.x)}, ${Math.round(markup.y)}) to (${Math.round(markup.endX!)}, ${Math.round(markup.endY!)})`;
    case 'text':
      return `Text label "${markup.text}" at position (${Math.round(markup.x)}, ${Math.round(markup.y)})`;
    default:
      return `Markup at position (${Math.round(markup.x)}, ${Math.round(markup.y)})`;
  }
};

export const extractRegionContext = (markups: Markup[]): string => {
  const descriptions = markups.map((markup, index) => {
    return `Region ${index + 1}: ${generateMarkupDescription(markup)}`;
  });

  return descriptions.join('\n');
};

export const createRegionPrompt = (markups: Markup[], basePrompt: string): string => {
  const regionContext = extractRegionContext(markups);

  return `The image has been marked with the following regions of interest:\n\n${regionContext}\n\nPlease focus your analysis on these marked regions.\n\n${basePrompt}`;
};

export const processMarkedImage = (imageData: string): string => {
  return imageData;
};

export const constructVisualPointingPrompt = (config: VisualPointingConfig): string => {
  const validation = validateVisualPointingConfig(config);

  if (!validation.valid) {
    throw new Error(`Invalid visual pointing configuration: ${validation.errors.join(', ')}`);
  }

  const regionPrompt = createRegionPrompt(config.markups, config.prompt);

  return regionPrompt;
};