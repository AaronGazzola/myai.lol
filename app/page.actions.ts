"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.util";
import { buildFewShotPrompt } from "@/lib/fewShotEngine";
import { OpenRouterClient } from "@/lib/openrouter";

interface Coordinate {
  x: number;
  y: number;
}

interface ExampleImageData {
  base64: string;
  name: string;
  coordinates: Coordinate[];
}

export interface AnalyzeFewShotInput {
  exampleImages: ExampleImageData[];
  targetImage: string;
  templateId: string;
}

export interface AnalysisResult {
  result: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export const analyzeFewShotAction = async (
  input: AnalyzeFewShotInput
): Promise<ActionResponse<AnalysisResult>> => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const prompt = buildFewShotPrompt({
      exampleImages: input.exampleImages.map((img) => ({
        id: img.name,
        name: img.name,
        coordinates: img.coordinates,
      })),
      selectedTemplate: input.templateId,
    });

    const images = [...input.exampleImages.map((img) => img.base64), input.targetImage];

    const client = new OpenRouterClient(apiKey);
    const model = "anthropic/claude-3.5-sonnet";

    const response = await client.sendImageAnalysis({
      apiKey,
      model,
      images,
      prompt,
      maxTokens: 4096,
      temperature: 0.7,
    });

    return getActionResponse({
      data: {
        result: response.choices[0].message.content,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        },
        model: response.model,
      },
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export interface StandardPromptInput {
  prompt: string;
  imageIds: string[];
  images: { id: string; base64: string }[];
}

export const submitStandardPromptAction = async (
  input: StandardPromptInput
): Promise<ActionResponse<AnalysisResult>> => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const images = input.images
      .filter(img => input.imageIds.includes(img.id))
      .map(img => img.base64);

    const client = new OpenRouterClient(apiKey);
    const model = "anthropic/claude-3.5-sonnet";

    const response = await client.sendImageAnalysis({
      apiKey,
      model,
      images,
      prompt: input.prompt,
      maxTokens: 4096,
      temperature: 0.7,
    });

    return getActionResponse({
      data: {
        result: response.choices[0].message.content,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        },
        model: response.model,
      },
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export interface FewShotPromptInput {
  prompt: string;
  targetImage: string;
  exampleImages: ExampleImageData[];
  subCategory: string;
}

export const submitFewShotPromptAction = async (
  input: FewShotPromptInput
): Promise<ActionResponse<AnalysisResult>> => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const prompt = buildFewShotPrompt({
      exampleImages: input.exampleImages.map((img) => ({
        id: img.name,
        name: img.name,
        coordinates: img.coordinates,
      })),
      selectedTemplate: input.subCategory,
    });

    const fullPrompt = `${prompt}\n\nUser Instruction: ${input.prompt}`;

    const images = [...input.exampleImages.map((img) => img.base64), input.targetImage];

    const client = new OpenRouterClient(apiKey);
    const model = "anthropic/claude-3.5-sonnet";

    const response = await client.sendImageAnalysis({
      apiKey,
      model,
      images,
      prompt: fullPrompt,
      maxTokens: 4096,
      temperature: 0.7,
    });

    return getActionResponse({
      data: {
        result: response.choices[0].message.content,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        },
        model: response.model,
      },
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export interface VisualPointingInput {
  imageId: string;
  imageBase64: string;
  markups: Array<{ type: string; data: unknown }>;
}

export const submitVisualPointingAction = async (
  input: VisualPointingInput
): Promise<ActionResponse<AnalysisResult>> => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const prompt = `Analyze this image with the following visual markups: ${JSON.stringify(input.markups, null, 0)}`;

    const client = new OpenRouterClient(apiKey);
    const model = "anthropic/claude-3.5-sonnet";

    const response = await client.sendImageAnalysis({
      apiKey,
      model,
      images: [input.imageBase64],
      prompt,
      maxTokens: 4096,
      temperature: 0.7,
    });

    return getActionResponse({
      data: {
        result: response.choices[0].message.content,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        },
        model: response.model,
      },
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export interface MultiImageInput {
  targetImageBase64: string;
  referenceImagesBase64: string[];
  relationshipType: string;
  contextDescription: string;
}

export const submitMultiImageAction = async (
  input: MultiImageInput
): Promise<ActionResponse<AnalysisResult>> => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const prompt = `Analyze these images with the following context:\nRelationship: ${input.relationshipType}\nDescription: ${input.contextDescription}`;

    const images = [...input.referenceImagesBase64, input.targetImageBase64];

    const client = new OpenRouterClient(apiKey);
    const model = "anthropic/claude-3.5-sonnet";

    const response = await client.sendImageAnalysis({
      apiKey,
      model,
      images,
      prompt,
      maxTokens: 4096,
      temperature: 0.7,
    });

    return getActionResponse({
      data: {
        result: response.choices[0].message.content,
        usage: {
          promptTokens: response.usage.prompt_tokens,
          completionTokens: response.usage.completion_tokens,
          totalTokens: response.usage.total_tokens,
        },
        model: response.model,
      },
    });
  } catch (error) {
    return getActionResponse({ error });
  }
};

export interface SequenceInput {
  cards: Array<{
    technique: string;
    data: StandardPromptInput | FewShotPromptInput | VisualPointingInput | MultiImageInput;
  }>;
}

export const submitSequenceAction = async (
  input: SequenceInput
): Promise<ActionResponse<AnalysisResult[]>> => {
  try {
    const results: AnalysisResult[] = [];

    for (const card of input.cards) {
      let response;

      if (card.technique === "standard") {
        response = await submitStandardPromptAction(card.data as StandardPromptInput);
      } else if (card.technique === "few-shot") {
        response = await submitFewShotPromptAction(card.data as FewShotPromptInput);
      } else if (card.technique === "visual-pointing") {
        response = await submitVisualPointingAction(card.data as VisualPointingInput);
      } else if (card.technique === "multi-image") {
        response = await submitMultiImageAction(card.data as MultiImageInput);
      }

      if (response && response.data && !response.error) {
        results.push(response.data);
      }
    }

    return getActionResponse({ data: results });
  } catch (error) {
    return getActionResponse({ error });
  }
};
