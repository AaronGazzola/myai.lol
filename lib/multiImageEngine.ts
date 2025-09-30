type RelationshipType = 'reference' | 'comparison' | 'example' | 'context';

interface MultiImageConfig {
  referenceImageIds: string[];
  targetImageId: string;
  relationshipType: RelationshipType;
  contextDescription?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateMultiImageConfig = (config: MultiImageConfig): ValidationResult => {
  const errors: string[] = [];

  if (!config.referenceImageIds || config.referenceImageIds.length === 0) {
    errors.push('At least one reference image is required');
  }

  if (config.referenceImageIds && config.referenceImageIds.length > 3) {
    errors.push('Maximum 3 reference images recommended for optimal performance');
  }

  if (!config.targetImageId) {
    errors.push('Target image is required');
  }

  if (config.referenceImageIds?.includes(config.targetImageId)) {
    errors.push('Target image cannot be the same as a reference image');
  }

  if (!config.relationshipType) {
    errors.push('Relationship type must be specified');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const formatReferenceImages = (referenceIds: string[], relationshipType: RelationshipType): string => {
  const count = referenceIds.length;
  const plural = count > 1 ? 's' : '';

  return `I am providing ${count} reference image${plural} for ${relationshipType} purposes.`;
};

export const generateComparisonContext = (relationshipType: RelationshipType, contextDescription?: string): string => {
  const baseContext = {
    reference: 'Use the reference image(s) to understand what the target should be compared against. These show the expected or typical appearance.',
    comparison: 'Compare the reference image(s) with the target image. Identify similarities, differences, and notable variations.',
    example: 'The reference image(s) show typical examples. Use these to understand the pattern and apply the same analysis to the target image.',
    context: 'The reference image(s) provide contextual information. Use this context to better understand and analyze the target image.'
  };

  const context = baseContext[relationshipType];

  if (contextDescription) {
    return `${context}\n\nAdditional context: ${contextDescription}`;
  }

  return context;
};

export const optimizeImageOrder = (referenceIds: string[]): string[] => {
  return [...referenceIds];
};

export const constructMultiImagePrompt = (config: MultiImageConfig): string => {
  const validation = validateMultiImageConfig(config);

  if (!validation.valid) {
    throw new Error(`Invalid multi-image configuration: ${validation.errors.join(', ')}`);
  }

  const optimizedReferences = optimizeImageOrder(config.referenceImageIds);
  const referenceContext = formatReferenceImages(optimizedReferences, config.relationshipType);
  const comparisonContext = generateComparisonContext(config.relationshipType, config.contextDescription);

  return `${referenceContext}\n\n${comparisonContext}\n\nNow, analyze the target image using the reference image(s) as specified above.`;
};