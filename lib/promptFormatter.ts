export interface FewShotExample {
  image: string;
  label: string;
}

export interface FewShotConfig {
  examples: FewShotExample[];
  targetImage: string;
  prompt: string;
}

export interface MultiStepConfig {
  steps: string[];
  image: string;
  prompt?: string;
}

export interface VisualPointingConfig {
  image: string;
  markup: {
    type: "circle" | "rectangle" | "arrow" | "text";
    color: string;
    data: Record<string, unknown>;
  }[];
  prompt: string;
}

export interface MultiImageConfig {
  referenceImages: string[];
  targetImage: string;
  relationshipType: "comparison" | "reference" | "example" | "context";
  contextDescription: string;
  prompt: string;
}

export const formatFewShotPrompt = (config: FewShotConfig): string => {
  let prompt = "I will provide several example images with their analysis, then ask you to analyze a new target image using the same approach.\n\n";

  config.examples.forEach((example, index) => {
    prompt += `Example ${index + 1}: ${example.label}\n`;
  });

  prompt += `\nNow analyze this target image using the same approach:\n${config.prompt}\n\n`;
  prompt += "Provide your analysis following the pattern shown in the examples.";

  return prompt;
};

export const formatMultiStepPrompt = (config: MultiStepConfig): string => {
  let prompt = "Please analyze this image step by step:\n\n";

  config.steps.forEach((step, index) => {
    prompt += `${index + 1}. ${step}\n`;
  });

  prompt += "\nProvide your analysis following each step in order. Show your reasoning for each step before moving to the next.";

  if (config.prompt) {
    prompt += `\n\nAdditional context: ${config.prompt}`;
  }

  return prompt;
};

export const formatVisualPointingPrompt = (config: VisualPointingConfig): string => {
  let prompt = "In this image, I've marked specific areas for you to focus on:\n\n";

  const markupDescriptions = config.markup.map((m) => {
    switch (m.type) {
      case "circle":
        return `- A ${m.color} circle highlighting a specific region`;
      case "rectangle":
        return `- A ${m.color} rectangle defining a region of interest`;
      case "arrow":
        return `- A ${m.color} arrow pointing to a specific element`;
      case "text":
        return `- A ${m.color} text label: "${m.data.text}"`;
      default:
        return "";
    }
  });

  prompt += markupDescriptions.join("\n");
  prompt += "\n\nFocus your analysis on the marked regions.\n\n";
  prompt += config.prompt;

  return prompt;
};

export const formatMultiImagePrompt = (config: MultiImageConfig): string => {
  let prompt = "";

  switch (config.relationshipType) {
    case "reference":
      prompt = `The first ${config.referenceImages.length} image(s) show reference examples of ${config.contextDescription}.\n\n`;
      prompt += "Use these references to understand what to look for in the target image.\n\n";
      break;
    case "comparison":
      prompt = `I'm providing ${config.referenceImages.length + 1} images for comparison.\n\n`;
      prompt += `Context: ${config.contextDescription}\n\n`;
      prompt += "Compare these images and identify similarities and differences.\n\n";
      break;
    case "example":
      prompt = `The first ${config.referenceImages.length} image(s) show typical examples of ${config.contextDescription}.\n\n`;
      prompt += "Now analyze the target image to determine if it follows the same pattern.\n\n";
      break;
    case "context":
      prompt = `Given the contextual information in the first ${config.referenceImages.length} image(s):\n`;
      prompt += `${config.contextDescription}\n\n`;
      prompt += "Now analyze the target image with this context in mind.\n\n";
      break;
  }

  prompt += `Task: ${config.prompt}`;

  return prompt;
};

export const addStructuredOutputRequest = (prompt: string, structure?: string): string => {
  const defaultStructure = `{
  "analysis": "your detailed analysis here",
  "confidence": "high|medium|low",
  "key_findings": ["finding 1", "finding 2", "..."],
  "total_count": null,
  "details": []
}`;

  return `${prompt}\n\nPlease provide your response in the following JSON format:\n\`\`\`json\n${structure || defaultStructure}\n\`\`\``;
};

export const formatPromptForTechnique = (
  technique: string,
  config: FewShotConfig | MultiStepConfig | VisualPointingConfig | MultiImageConfig | { prompt?: string }
): string => {
  switch (technique) {
    case "few-shot":
      return formatFewShotPrompt(config as FewShotConfig);
    case "multi-step":
      return formatMultiStepPrompt(config as MultiStepConfig);
    case "visual-pointing":
      return formatVisualPointingPrompt(config as VisualPointingConfig);
    case "multi-image":
      return formatMultiImagePrompt(config as MultiImageConfig);
    default:
      return config.prompt || "";
  }
};