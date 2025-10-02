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
