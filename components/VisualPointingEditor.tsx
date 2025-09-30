"use client";

import { useRef, useState, useEffect, MouseEvent } from "react";
import { cn } from "@/lib/shadcn.utils";

export type MarkupType = "circle" | "rectangle" | "arrow" | "text";

export interface MarkupElement {
  id: string;
  type: MarkupType;
  color: string;
  data: any;
}

export interface VisualPointingConfig {
  imageId: string | null;
  markups: MarkupElement[];
}

interface VisualPointingEditorProps {
  config: VisualPointingConfig;
  onChange: (config: VisualPointingConfig) => void;
  uploadedImages: Array<{ id: string; preview: string; name: string }>;
}

const COLORS = [
  { name: "Red", value: "#EF4444" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
];

const TOOLS: Array<{ id: MarkupType; name: string; icon: string }> = [
  { id: "circle", name: "Circle", icon: "○" },
  { id: "rectangle", name: "Rectangle", icon: "□" },
  { id: "arrow", name: "Arrow", icon: "→" },
  { id: "text", name: "Text", icon: "T" },
];

export default function VisualPointingEditor({
  config,
  onChange,
  uploadedImages,
}: VisualPointingEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTool, setSelectedTool] = useState<MarkupType>("circle");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const selectedImage = uploadedImages.find((img) => img.id === config.imageId);

  useEffect(() => {
    if (!canvasRef.current || !selectedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      setImageLoaded(true);
      redrawMarkups();
    };
    img.src = selectedImage.preview;
  }, [selectedImage]);

  const redrawMarkups = () => {
    if (!canvasRef.current || !selectedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      config.markups.forEach((markup) => {
        ctx.strokeStyle = markup.color;
        ctx.fillStyle = markup.color;
        ctx.lineWidth = 3;

        switch (markup.type) {
          case "circle":
            ctx.beginPath();
            ctx.arc(markup.data.x, markup.data.y, markup.data.radius, 0, 2 * Math.PI);
            ctx.stroke();
            break;
          case "rectangle":
            ctx.strokeRect(
              markup.data.x,
              markup.data.y,
              markup.data.width,
              markup.data.height
            );
            break;
          case "arrow":
            drawArrow(
              ctx,
              markup.data.startX,
              markup.data.startY,
              markup.data.endX,
              markup.data.endY
            );
            break;
          case "text":
            ctx.font = "20px Arial";
            ctx.fillText(markup.data.text, markup.data.x, markup.data.y);
            break;
        }
      });
    };
    img.src = selectedImage.preview;
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const getCanvasCoords = (e: MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!imageLoaded) return;
    const coords = getCanvasCoords(e);
    setStartPoint(coords);
    setIsDrawing(true);

    if (selectedTool === "text") {
      const text = prompt("Enter text:");
      if (text) {
        addMarkup({
          type: "text",
          data: { x: coords.x, y: coords.y, text },
        });
      }
      setIsDrawing(false);
    }
  };

  const handleMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;

    const coords = getCanvasCoords(e);

    if (selectedTool === "circle") {
      const radius = Math.sqrt(
        Math.pow(coords.x - startPoint.x, 2) + Math.pow(coords.y - startPoint.y, 2)
      );
      addMarkup({
        type: "circle",
        data: { x: startPoint.x, y: startPoint.y, radius },
      });
    } else if (selectedTool === "rectangle") {
      addMarkup({
        type: "rectangle",
        data: {
          x: Math.min(startPoint.x, coords.x),
          y: Math.min(startPoint.y, coords.y),
          width: Math.abs(coords.x - startPoint.x),
          height: Math.abs(coords.y - startPoint.y),
        },
      });
    } else if (selectedTool === "arrow") {
      addMarkup({
        type: "arrow",
        data: {
          startX: startPoint.x,
          startY: startPoint.y,
          endX: coords.x,
          endY: coords.y,
        },
      });
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  const addMarkup = (markup: Omit<MarkupElement, "id" | "color">) => {
    const newMarkup: MarkupElement = {
      id: `markup-${Date.now()}-${Math.random()}`,
      color: selectedColor,
      ...markup,
    };

    onChange({
      ...config,
      markups: [...config.markups, newMarkup],
    });

    setTimeout(redrawMarkups, 0);
  };

  const removeMarkup = (id: string) => {
    onChange({
      ...config,
      markups: config.markups.filter((m) => m.id !== id),
    });

    setTimeout(redrawMarkups, 0);
  };

  const clearAll = () => {
    onChange({
      ...config,
      markups: [],
    });

    setTimeout(redrawMarkups, 0);
  };

  const selectImage = (imageId: string) => {
    onChange({
      imageId: config.imageId === imageId ? null : imageId,
      markups: [],
    });
    setImageLoaded(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-medium text-orange-900 mb-2">Visual Pointing</h4>
        <p className="text-sm text-orange-700">
          Mark specific regions on your image to direct AI attention to areas of interest.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Image to Annotate
        </label>
        {uploadedImages.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No images uploaded yet</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {uploadedImages.map((image) => (
              <button
                key={image.id}
                onClick={() => selectImage(image.id)}
                className={cn(
                  "relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200",
                  config.imageId === image.id
                    ? "border-orange-500 ring-2 ring-orange-200"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <img
                  src={image.preview}
                  alt={image.name}
                  className="w-full h-full object-cover"
                />
                {config.imageId === image.id && (
                  <div className="absolute inset-0 bg-orange-500 bg-opacity-20" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {config.imageId && selectedImage && (
        <>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Drawing Tool
              </label>
              <div className="flex gap-2">
                {TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={cn(
                      "px-4 py-2 rounded border-2 transition-all duration-200 font-medium",
                      selectedTool === tool.id
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    )}
                  >
                    <span className="text-lg mr-2">{tool.icon}</span>
                    {tool.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all duration-200",
                      selectedColor === color.value
                        ? "border-gray-900 scale-110"
                        : "border-gray-300"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearAll}
                className="px-3 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          <div ref={containerRef} className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              className="max-w-full h-auto cursor-crosshair"
            />
          </div>

          {config.markups.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Markups ({config.markups.length})
              </label>
              <div className="space-y-2">
                {config.markups.map((markup, index) => (
                  <div
                    key={markup.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: markup.color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {markup.type.charAt(0).toUpperCase() + markup.type.slice(1)} #{index + 1}
                      </span>
                    </div>
                    <button
                      onClick={() => removeMarkup(markup.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}