export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  images: string[];
  prompt: string;
  technique?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const SUPPORTED_MODELS = {
  "openai/gpt-4o": {
    name: "GPT-4o",
    description: "Best for detailed object recognition",
    maxImages: 10,
    cost: "medium",
  },
  "anthropic/claude-3.5-sonnet": {
    name: "Claude 3.5 Sonnet",
    description: "Excellent vision + reasoning",
    maxImages: 20,
    cost: "medium",
  },
  "google/gemini-pro-vision": {
    name: "Gemini Pro Vision",
    description: "Cost-effective alternative",
    maxImages: 16,
    cost: "low",
  },
};

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendImageAnalysis(config: OpenRouterConfig): Promise<OpenRouterResponse> {
    const messages = [
      {
        role: "user",
        content: [
          ...config.images.map((image) => ({
            type: "image_url",
            image_url: { url: image },
          })),
          {
            type: "text",
            text: config.prompt,
          },
        ],
      },
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.href : "",
        "X-Title": "AI Image Analysis Workflow Builder",
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens || 4096,
        temperature: config.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error?.message || `API request failed: ${response.status}`);
    }

    return response.json();
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async streamResponse(config: OpenRouterConfig): Promise<ReadableStream> {
    const messages = [
      {
        role: "user",
        content: [
          ...config.images.map((image) => ({
            type: "image_url",
            image_url: { url: image },
          })),
          {
            type: "text",
            text: config.prompt,
          },
        ],
      },
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": typeof window !== "undefined" ? window.location.href : "",
        "X-Title": "AI Image Analysis Workflow Builder",
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        max_tokens: config.maxTokens || 4096,
        temperature: config.temperature || 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Stream request failed: ${response.status}`);
    }

    return response.body!;
  }
}

export const createClient = (apiKey: string): OpenRouterClient => {
  return new OpenRouterClient(apiKey);
};

export const encodeImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const validateModelCapabilities = (technique: string, model: string): boolean => {
  const modelInfo = SUPPORTED_MODELS[model as keyof typeof SUPPORTED_MODELS];
  if (!modelInfo) return false;

  if (technique === "multi-image" || technique === "few-shot") {
    return true;
  }

  return true;
};