type FewShotPattern = 'classification' | 'counting' | 'identification' | 'description';

interface FewShotExample {
  imageId: string;
  label: string;
}

interface FewShotConfig {
  examples: FewShotExample[];
  targetImageId: string;
  pattern?: FewShotPattern;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateFewShotConfig = (config: FewShotConfig): ValidationResult => {
  const errors: string[] = [];

  if (!config.examples || config.examples.length < 2) {
    errors.push('Few-shot learning requires at least 2 examples');
  }

  if (config.examples && config.examples.length > 5) {
    errors.push('Few-shot learning recommends maximum 5 examples for optimal performance');
  }

  if (!config.targetImageId) {
    errors.push('Target image must be specified');
  }

  config.examples?.forEach((example, index) => {
    if (!example.imageId) {
      errors.push(`Example ${index + 1} missing image`);
    }
    if (!example.label || example.label.trim() === '') {
      errors.push(`Example ${index + 1} missing label`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

export const formatExamples = (examples: FewShotExample[]): string => {
  return examples.map((example, index) => {
    return `Example ${index + 1}: ${example.label}`;
  }).join('\n');
};

export const generateLearningContext = (examples: FewShotExample[], pattern?: FewShotPattern): string => {
  const patternContext = {
    classification: 'Learn the classification pattern from these examples and apply it to the target image.',
    counting: 'Learn the counting pattern from these examples and apply it to the target image.',
    identification: 'Learn the identification pattern from these examples and apply it to the target image.',
    description: 'Learn the description pattern from these examples and apply it to the target image.'
  };

  const context = pattern ? patternContext[pattern] : 'Learn the pattern from these examples and apply it to the target image.';

  return `I will show you ${examples.length} example(s) with their correct outputs. ${context}\n\nExamples:\n${formatExamples(examples)}\n\nNow, apply the same pattern to analyze the target image.`;
};

export const optimizeExampleOrder = (examples: FewShotExample[]): FewShotExample[] => {
  const sorted = [...examples];

  sorted.sort((a, b) => {
    const aComplexity = a.label.split(' ').length;
    const bComplexity = b.label.split(' ').length;
    return aComplexity - bComplexity;
  });

  return sorted;
};

export const constructFewShotPrompt = (config: FewShotConfig): string => {
  const validation = validateFewShotConfig(config);

  if (!validation.valid) {
    throw new Error(`Invalid few-shot configuration: ${validation.errors.join(', ')}`);
  }

  const optimizedExamples = optimizeExampleOrder(config.examples);
  const learningContext = generateLearningContext(optimizedExamples, config.pattern);

  return learningContext;
};