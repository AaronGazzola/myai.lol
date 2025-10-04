"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import DropZone from "@/components/DropZone";
import PromptCard, { PromptCardConfig, TechniqueType } from "@/components/PromptCard";
import InsertCardButton from "@/components/InsertCardButton";
import { useAnalyzeFewShot } from "./page.hooks";
import { encodeImageToBase64 } from "@/lib/openrouter";
import { AnalysisResult } from "./page.actions";

const queryClient = new QueryClient();

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
}

function HomeContent() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [promptCards, setPromptCards] = useState<PromptCardConfig[]>([
    {
      id: `card-${Date.now()}`,
      technique: "standard" as TechniqueType,
      prompt: "",
      assignedImages: [],
    },
  ]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const analyzeMutation = useAnalyzeFewShot();

  const handleImagesUploaded = (newImages: UploadedImage[]) => {
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });

    setPromptCards((prev) =>
      prev.map((card) => ({
        ...card,
        assignedImages: card.assignedImages.filter((imgId) => imgId !== id),
      }))
    );
  };

  const handleReorderImages = (fromIndex: number, toIndex: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const [removed] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, removed);
      return newImages;
    });
  };

  const handleCardUpdate = (index: number, config: PromptCardConfig) => {
    setPromptCards((prev) => {
      const newCards = [...prev];
      newCards[index] = config;
      return newCards;
    });
  };

  const handleAddCard = (index: number, position: "above" | "below") => {
    const newCard: PromptCardConfig = {
      id: `card-${Date.now()}-${Math.random()}`,
      technique: "standard" as TechniqueType,
      prompt: "",
      assignedImages: [],
    };

    setPromptCards((prev) => {
      const newCards = [...prev];
      const insertIndex = position === "above" ? index : index + 1;
      newCards.splice(insertIndex, 0, newCard);
      return newCards;
    });
  };

  const handleDeleteCard = (index: number) => {
    if (promptCards.length === 1) return;
    setPromptCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    const firstCard = promptCards[0];
    if (
      firstCard.technique !== "few-shot" ||
      !firstCard.metadata?.fewShot ||
      !firstCard.metadata.fewShot.exampleImages.length ||
      !firstCard.metadata.fewShot.targetImageId ||
      !firstCard.selectedSubCategory
    ) {
      return;
    }

    const fewShot = firstCard.metadata.fewShot;
    const targetImage = fewShot.exampleImages.find(
      (img) => img.id === fewShot.targetImageId
    );
    if (!targetImage) return;

    const exampleImages = fewShot.exampleImages.filter(
      (img) => img.id !== fewShot.targetImageId
    );

    try {
      const exampleImagesData = await Promise.all(
        exampleImages.map(async (img) => ({
          base64: await encodeImageToBase64(img.file),
          name: img.name,
          coordinates: img.coordinates,
        }))
      );

      const targetImageBase64 = await encodeImageToBase64(targetImage.file);

      const result = await analyzeMutation.mutateAsync({
        exampleImages: exampleImagesData,
        targetImage: targetImageBase64,
        templateId: firstCard.selectedSubCategory,
      });

      setAnalysisResult(result);
    } catch (error) {
      console.error(JSON.stringify({error,label:"analyze"}));
    }
  };

  const canAnalyze = () => {
    const firstCard = promptCards[0];
    const fewShot = firstCard.metadata?.fewShot;
    return (
      firstCard.technique === "few-shot" &&
      fewShot?.exampleImages &&
      fewShot.exampleImages.length > 0 &&
      fewShot.targetImageId !== null &&
      firstCard.selectedSubCategory !== undefined
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Image Analysis Workflow
          </h1>
          <p className="mt-2 text-gray-600">
            Upload images and configure advanced prompt engineering techniques
          </p>
        </div>

        <div className="space-y-8">
          <DropZone
            onImagesUploaded={handleImagesUploaded}
            uploadedImages={images}
            onRemoveImage={handleRemoveImage}
            onReorderImages={handleReorderImages}
          />

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Prompt Workflow ({promptCards.length})
            </h2>
            <div className="space-y-4">
              {promptCards.map((card, index) => (
                <div key={card.id}>
                  <PromptCard
                    config={card}
                    onUpdate={(config) => handleCardUpdate(index, config)}
                    onAddBelow={() => handleAddCard(index, "below")}
                    onDelete={() => handleDeleteCard(index)}
                    uploadedImages={images}
                  />
                  {index < promptCards.length - 1 && (
                    <InsertCardButton onClick={() => handleAddCard(index, "below")} />
                  )}
                </div>
              ))}

              {canAnalyze() && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzeMutation.isPending}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {analyzeMutation.isPending ? "Analyzing..." : "Analyze with AI"}
                  </button>
                </div>
              )}

              {analysisResult && (
                <div className="bg-white border-2 border-blue-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Analysis Result</h3>
                    <button
                      onClick={() => navigator.clipboard.writeText(analysisResult.result)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="prose prose-sm max-w-none mb-4">
                    <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm">
                      {analysisResult.result}
                    </pre>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-3">
                    <span>Model: {analysisResult.model}</span>
                    <span>•</span>
                    <span>Tokens: {analysisResult.usage.totalTokens}</span>
                    <span>•</span>
                    <span>
                      Prompt: {analysisResult.usage.promptTokens} / Completion: {analysisResult.usage.completionTokens}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <HomeContent />
    </QueryClientProvider>
  );
}