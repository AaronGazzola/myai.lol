type ReasoningPattern = 'sequential' | 'conditional' | 'iterative' | 'verification';

interface Step {
  instruction: string;
  pattern?: ReasoningPattern;
}

interface MultiStepConfig {
  steps: Step[];
  imageId?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validateStepSequence = (steps: Step[]): ValidationResult => {
  const errors: string[] = [];

  if (!steps || steps.length === 0) {
    errors.push('At least one step is required');
  }

  if (steps && steps.length > 10) {
    errors.push('Too many steps (maximum 10 recommended for clarity)');
  }

  steps?.forEach((step, index) => {
    if (!step.instruction || step.instruction.trim() === '') {
      errors.push(`Step ${index + 1} missing instruction`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

export const formatStepInstructions = (steps: Step[]): string => {
  return steps.map((step, index) => {
    return `Step ${index + 1}: ${step.instruction}`;
  }).join('\n\n');
};

export const addReasoningContext = (prompt: string): string => {
  const reasoningPhrases = [
    'Think through this carefully and systematically.',
    'Show your reasoning for each step.',
    'Explain your thought process as you work through each step.'
  ];

  return `${reasoningPhrases.join(' ')}\n\n${prompt}`;
};

export const generateVerificationStep = (): Step => {
  return {
    instruction: 'Review your analysis from all previous steps and verify the accuracy of your conclusions. If you find any inconsistencies, correct them and explain the correction.',
    pattern: 'verification'
  };
};

export const constructMultiStepPrompt = (config: MultiStepConfig, includeVerification: boolean = true): string => {
  const validation = validateStepSequence(config.steps);

  if (!validation.valid) {
    throw new Error(`Invalid multi-step configuration: ${validation.errors.join(', ')}`);
  }

  let steps = [...config.steps];

  if (includeVerification && !steps.some(s => s.pattern === 'verification')) {
    steps.push(generateVerificationStep());
  }

  const formattedSteps = formatStepInstructions(steps);
  const promptWithReasoning = addReasoningContext(formattedSteps);

  return promptWithReasoning;
};