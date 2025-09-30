"use client";

import { useState } from "react";
import DropZone from "@/components/DropZone";
import PromptCard, { PromptCardConfig, TechniqueType } from "@/components/PromptCard";

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: number;
}

export default function Home() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [promptCards, setPromptCards] = useState<PromptCardConfig[]>([
    {
      id: `card-${Date.now()}`,
      technique: "standard" as TechniqueType,
      prompt: "",
      assignedImages: [],
    },
  ]);

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
                <PromptCard
                  key={card.id}
                  config={card}
                  onUpdate={(config) => handleCardUpdate(index, config)}
                  onAddAbove={() => handleAddCard(index, "above")}
                  onAddBelow={() => handleAddCard(index, "below")}
                  onDelete={() => handleDeleteCard(index)}
                  uploadedImages={images}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}