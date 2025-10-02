interface Coordinate {
  x: number;
  y: number;
}

interface ExampleImage {
  id: string;
  name: string;
  coordinates: Coordinate[];
}

interface FewShotConfig {
  exampleImages: ExampleImage[];
  selectedTemplate: string | null;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const TEMPLATES = {
  counting: {
    id: "counting",
    name: "Object Counting",
    instruction: "Count the objects at the marked coordinates in each example image. Then apply the same counting method to identify and count similar objects in the target image.",
  },
  identification: {
    id: "identification",
    name: "Object Identification",
    instruction: "Identify the objects at the marked coordinates in each example image. Then apply the same identification pattern to locate and identify similar objects in the target image.",
  },
  classification: {
    id: "classification",
    name: "Classification",
    instruction: "Classify the patterns or objects at the marked coordinates in each example image. Then apply the same classification criteria to the target image.",
  },
};

export const validateFewShotConfig = (config: FewShotConfig): ValidationResult => {
  const errors: string[] = [];

  if (!config.exampleImages || config.exampleImages.length < 1) {
    errors.push('Few-shot learning requires at least 1 example image');
  }

  if (config.exampleImages && config.exampleImages.length > 5) {
    errors.push('Few-shot learning recommends maximum 5 examples for optimal performance');
  }

  if (!config.selectedTemplate) {
    errors.push('Analysis template must be selected');
  }

  config.exampleImages?.forEach((example, index) => {
    if (!example.coordinates || example.coordinates.length === 0) {
      errors.push(`Example ${index + 1} has no marked coordinates`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};

export const formatCoordinates = (coordinates: Coordinate[]): string => {
  return coordinates.map((coord, i) =>
    `  - Point ${i + 1} at (${coord.x.toFixed(1)}%, ${coord.y.toFixed(1)}%) measured from the top-left corner`
  ).join('\n');
};

export const formatExamples = (exampleImages: ExampleImage[]): string => {
  return exampleImages.map((example, index) => {
    const imageNum = index + 1;
    const coordText = formatCoordinates(example.coordinates);
    return `IMAGE ${imageNum} - "${example.name}" (EXAMPLE):
This image shows example objects/patterns for you to learn from.
The objects of interest are located at these coordinate positions:
${coordText}`;
  }).join('\n\n');
};

export const buildFewShotPrompt = (config: FewShotConfig): string => {
  const validation = validateFewShotConfig(config);

  if (!validation.valid) {
    throw new Error(`Invalid few-shot configuration: ${validation.errors.join(', ')}`);
  }

  const template = config.selectedTemplate ? TEMPLATES[config.selectedTemplate as keyof typeof TEMPLATES] : null;

  if (!template) {
    throw new Error('Invalid template selected');
  }

  const totalImages = config.exampleImages.length + 1;
  const targetImageNum = totalImages;
  const examplesText = formatExamples(config.exampleImages);

  return `You will be shown ${totalImages} images in sequence. The first ${config.exampleImages.length} image(s) are EXAMPLES with marked coordinates, and the final image (IMAGE ${targetImageNum}) is the TARGET image to analyze.

${examplesText}

IMAGE ${targetImageNum} (TARGET):
This is the image you need to analyze. Apply what you learned from the example images.

INSTRUCTIONS:
${template.instruction}

COORDINATE SYSTEM:
- Coordinates are given as (X%, Y%) percentages from the top-left corner of each image
- (0%, 0%) = top-left corner
- (100%, 100%) = bottom-right corner
- For example, (50%, 50%) is the center of the image

TASK:
1. First, carefully examine IMAGE(S) 1-${config.exampleImages.length} to understand what objects/patterns are located at the marked coordinate positions
2. Then, analyze IMAGE ${targetImageNum} (the final image shown) to identify similar objects or patterns
3. Provide your analysis of IMAGE ${targetImageNum}, identifying where similar objects/patterns appear

Focus your analysis on the TARGET image (the last image). Use the example images only as reference for what to look for.`;
};
