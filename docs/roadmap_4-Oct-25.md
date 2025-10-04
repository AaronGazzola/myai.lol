# Prompt Card Submission & Image Marker Implementation Roadmap

This roadmap completes the missing functionality from the previous roadmap (roadmap_3-Oct-25.md), focusing on implementing the actual submission flow and image marker overlay system for few-shot learning.

## 🎯 Current Status (Updated: 4-Oct-2025)

### ✅ COMPLETED PHASES

None - This is a new roadmap to complete skipped functionality from roadmap_3-Oct-25.md

### 🔄 IN PROGRESS

None - Ready to begin Phase 1

### ⏳ REMAINING WORK

- **Phase 1**: Create image marker overlay utility for few-shot coordinates
- **Phase 2**: Wire PromptCard submit button to parent callback
- **Phase 3**: Implement page-level submission handlers with hooks
- **Phase 4**: Connect sequence button to actual execution
- **Phase 5**: Add results display UI for analysis output
- **Phase 6**: Production build validation and testing

### 🚀 READY TO USE

Current functionality (from previous roadmap):
- Prompt card interface with technique selection
- Few-shot layout with target image and example images grid
- Coordinate marking system via ImageMarkerSheet
- Validation logic for all submission types
- Server actions and hooks infrastructure (created but not wired)

### 📍 NEXT STEPS

1. Create coordinate marker overlay utility to draw red circles on images
2. Add onSubmit callback prop to PromptCard component
3. Wire up submission handlers in page.tsx using existing hooks
4. Test complete submission flow with actual API calls

## Prerequisites

- ✅ Next.js 15 with App Router
- ✅ TypeScript with strict mode
- ✅ TailwindCSS v4
- ✅ React Query (@tanstack/react-query)
- ✅ Existing PromptCard component structure
- ✅ ImageMarkerSheet component with coordinate marking
- ✅ Server actions in app/page.actions.ts
- ✅ React Query hooks in app/page.hooks.tsx
- ✅ OpenRouter client with encodeImageToBase64 utility
- ✅ Canvas-based image processing utilities in lib/imagePreprocessing.ts

## ⏳ Phase 1: Create Image Marker Overlay Utility

### ⏳ 1.1 Create Coordinate Marker Drawing Utility (`lib/fewshot.util.ts`) - PENDING

Implement utility to draw visual markers on example images at coordinate positions:

- Create new file lib/fewshot.util.ts
- Export async function drawCoordinateMarkers(imageUrl: string, coordinates: Coordinate[]): Promise<string>
- Load image into canvas element
- Convert percentage coordinates to pixel positions
- Draw red circles (radius: 8px, stroke width: 3px, color: #EF4444) at each coordinate
- Add white outline (stroke width: 5px) behind red circle for visibility
- Number each marker (1, 2, 3...) with white text and black outline
- Return base64 data URL of marked image
- Handle errors gracefully with proper error messages

**Coordinate Conversion Logic:**

- Input coordinates are percentages: { x: 25.5, y: 50.0 } means (25.5%, 50.0%)
- Convert to pixels: pixelX = (x / 100) * imageWidth
- Convert to pixels: pixelY = (y / 100) * imageHeight

**Key Methods/Features Required:**

- `drawCoordinateMarkers(imageUrl: string, coordinates: Coordinate[]): Promise<string>` - Main function
- `convertPercentToPixels(percent: number, dimension: number): number` - Helper for conversion
- `drawMarker(ctx: CanvasRenderingContext2D, x: number, y: number, index: number): void` - Draw single marker

**Implementation Details:**

```typescript
interface Coordinate {
  x: number;
  y: number;
}

export const drawCoordinateMarkers = async (
  imageUrl: string,
  coordinates: Coordinate[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);

      coordinates.forEach((coord, index) => {
        const pixelX = (coord.x / 100) * img.width;
        const pixelY = (coord.y / 100) * img.height;

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, 8, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pixelX, pixelY, 8, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeText(String(index + 1), pixelX, pixelY);
        ctx.fillStyle = 'white';
        ctx.fillText(String(index + 1), pixelX, pixelY);
      });

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create marked image'));
            return;
          }

          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read marked image'));
          reader.readAsDataURL(blob);
        },
        'image/png',
        1.0
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageUrl;
  });
};
```

### ⏳ 1.2 Add Type Definitions (`lib/fewshot.util.ts`) - PENDING

Export shared types for few-shot processing:

- Export Coordinate interface
- Export ExampleImageWithMarkers interface
- Export ProcessedFewShotData interface for submission payload

**Type Definitions:**

```typescript
export interface Coordinate {
  x: number;
  y: number;
}

export interface ExampleImageWithMarkers {
  id: string;
  name: string;
  originalPreview: string;
  markedPreview: string;
  markedBase64: string;
  coordinates: Coordinate[];
}

export interface ProcessedFewShotData {
  prompt: string;
  targetImageBase64: string;
  exampleImages: Array<{
    base64: string;
    name: string;
    coordinates: Coordinate[];
  }>;
  subCategory: string;
}
```

## ⏳ Phase 2: Wire PromptCard Submit Button to Parent Callback

### ⏳ 2.1 Add onSubmit Prop to PromptCard (`components/PromptCard.tsx`) - PENDING

Update PromptCard to accept submission callback from parent:

- Add onSubmit?: (config: PromptCardConfig) => void to PromptCardProps interface
- Update handleSubmitCard to call onSubmit?.(config) instead of console.log
- Remove console.log from handleSubmitCard
- Keep canSubmitCard validation logic unchanged

**Updated Interface:**

```typescript
interface PromptCardProps {
  config: PromptCardConfig;
  onUpdate: (config: PromptCardConfig) => void;
  onAddBelow: () => void;
  onDelete: () => void;
  onSubmit?: (config: PromptCardConfig) => void;
}
```

**Updated Handler:**

```typescript
const handleSubmitCard = () => {
  if (!canSubmitCard()) return;
  onSubmit?.(config);
};
```

### ⏳ 2.2 Add Loading State Support (`components/PromptCard.tsx`) - PENDING

Add loading indicator for submission state:

- Add isSubmitting?: boolean to PromptCardProps
- Disable submit button when isSubmitting is true
- Show loading spinner in button when submitting
- Update button text to "Submitting..." during submission

**Updated Props:**

```typescript
interface PromptCardProps {
  config: PromptCardConfig;
  onUpdate: (config: PromptCardConfig) => void;
  onAddBelow: () => void;
  onDelete: () => void;
  onSubmit?: (config: PromptCardConfig) => void;
  isSubmitting?: boolean;
}
```

**Updated Button:**

```typescript
<button
  onClick={handleSubmitCard}
  disabled={!canSubmitCard() || isSubmitting}
  className={cn(
    "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
    canSubmitCard() && !isSubmitting
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-100 text-gray-400 cursor-not-allowed"
  )}
>
  {isSubmitting ? (
    <>
      <span>Submitting...</span>
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </>
  ) : (
    <>
      <span>Submit single prompt</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    </>
  )}
</button>
```

## ⏳ Phase 3: Implement Page-Level Submission Handlers

### ⏳ 3.1 Import Submission Hooks (`app/page.tsx`) - PENDING

Import and initialize all submission hooks:

- Import drawCoordinateMarkers from lib/fewshot.util
- Import all submission hooks from ./page.hooks
- Initialize hooks: useSubmitStandardPrompt, useSubmitFewShotPrompt, useSubmitVisualPointing, useSubmitMultiImage
- Track which card is currently submitting with state

**Imports:**

```typescript
import { drawCoordinateMarkers } from "@/lib/fewshot.util";
import {
  useSubmitStandardPrompt,
  useSubmitFewShotPrompt,
  useSubmitVisualPointing,
  useSubmitMultiImage,
} from "./page.hooks";
```

**Hook Initialization:**

```typescript
const submitStandard = useSubmitStandardPrompt();
const submitFewShot = useSubmitFewShotPrompt();
const submitVisualPointing = useSubmitVisualPointing();
const submitMultiImage = useSubmitMultiImage();
const [submittingCardId, setSubmittingCardId] = useState<string | null>(null);
```

### ⏳ 3.2 Create Standard Prompt Submit Handler (`app/page.tsx`) - PENDING

Implement handler for standard prompt submission:

- Create async handleSubmitStandardPrompt(config: PromptCardConfig) function
- Extract assignedImages from config
- Convert File objects to base64 using encodeImageToBase64
- Call submitStandard.mutateAsync with proper payload
- Handle success: update analysisResult state
- Handle errors: log with conditionalLog
- Clear submittingCardId when done

**Implementation:**

```typescript
const handleSubmitStandardPrompt = async (config: PromptCardConfig) => {
  try {
    setSubmittingCardId(config.id);

    const images = await Promise.all(
      config.assignedImages.map(async (imgId) => {
        const img = uploadedImages.find(i => i.id === imgId);
        if (!img) throw new Error(`Image ${imgId} not found`);
        return {
          id: img.id,
          base64: await encodeImageToBase64(img.file),
        };
      })
    );

    const result = await submitStandard.mutateAsync({
      prompt: config.prompt,
      imageIds: config.assignedImages,
      images,
    });

    setAnalysisResult(result);
  } catch (error) {
    conditionalLog('submit-standard', { error, config });
  } finally {
    setSubmittingCardId(null);
  }
};
```

### ⏳ 3.3 Create Few-Shot Prompt Submit Handler (`app/page.tsx`) - PENDING

Implement handler for few-shot prompt submission with marker overlay:

- Create async handleSubmitFewShotPrompt(config: PromptCardConfig) function
- Extract targetImage and exampleImages from config.metadata.fewShot
- Validate targetImage and exampleImages exist
- For each example image:
  - Draw coordinate markers using drawCoordinateMarkers
  - Convert marked image to base64
- Convert target image to base64
- Call submitFewShot.mutateAsync with processed data
- Handle success: update analysisResult state
- Handle errors: log with conditionalLog
- Clear submittingCardId when done

**Implementation:**

```typescript
const handleSubmitFewShotPrompt = async (config: PromptCardConfig) => {
  try {
    setSubmittingCardId(config.id);

    const fewShot = config.metadata?.fewShot;
    if (!fewShot?.targetImage || !fewShot.exampleImages.length) {
      throw new Error('Missing target image or example images');
    }

    const exampleImagesData = await Promise.all(
      fewShot.exampleImages.map(async (img) => {
        const markedImageDataUrl = await drawCoordinateMarkers(
          img.preview,
          img.coordinates
        );

        return {
          base64: markedImageDataUrl,
          name: img.name,
          coordinates: img.coordinates,
        };
      })
    );

    const targetImageBase64 = await encodeImageToBase64(fewShot.targetImage.file);

    const result = await submitFewShot.mutateAsync({
      prompt: config.prompt,
      targetImage: targetImageBase64,
      exampleImages: exampleImagesData,
      subCategory: config.selectedSubCategory || 'counting',
    });

    setAnalysisResult(result);
  } catch (error) {
    conditionalLog('submit-fewshot', { error, config });
  } finally {
    setSubmittingCardId(null);
  }
};
```

### ⏳ 3.4 Create Visual Pointing Submit Handler (`app/page.tsx`) - PENDING

Implement handler for visual pointing submission:

- Create async handleSubmitVisualPointing(config: PromptCardConfig) function
- Extract imageId and markups from config.metadata.visualPointing
- Convert image to base64
- Call submitVisualPointing.mutateAsync with payload
- Handle success and errors
- Clear submittingCardId when done

**Implementation:**

```typescript
const handleSubmitVisualPointing = async (config: PromptCardConfig) => {
  try {
    setSubmittingCardId(config.id);

    const vp = config.metadata?.visualPointing;
    if (!vp?.image || !vp.markups.length) {
      throw new Error('Missing image or markups');
    }

    const imageBase64 = await encodeImageToBase64(vp.image.file);

    const result = await submitVisualPointing.mutateAsync({
      imageId: vp.imageId!,
      imageBase64,
      markups: vp.markups,
    });

    setAnalysisResult(result);
  } catch (error) {
    conditionalLog('submit-visual-pointing', { error, config });
  } finally {
    setSubmittingCardId(null);
  }
};
```

### ⏳ 3.5 Create Multi-Image Submit Handler (`app/page.tsx`) - PENDING

Implement handler for multi-image submission:

- Create async handleSubmitMultiImage(config: PromptCardConfig) function
- Extract targetImageId, referenceImageIds, relationshipType, contextDescription
- Convert all images to base64
- Call submitMultiImage.mutateAsync with payload
- Handle success and errors
- Clear submittingCardId when done

**Implementation:**

```typescript
const handleSubmitMultiImage = async (config: PromptCardConfig) => {
  try {
    setSubmittingCardId(config.id);

    const mi = config.metadata?.multiImage;
    if (!mi?.targetImageId || !mi.referenceImageIds.length) {
      throw new Error('Missing target or reference images');
    }

    const targetImage = uploadedImages.find(i => i.id === mi.targetImageId);
    if (!targetImage) throw new Error('Target image not found');

    const referenceImages = mi.referenceImageIds
      .map(id => uploadedImages.find(i => i.id === id))
      .filter((img): img is NonNullable<typeof img> => img !== undefined);

    const targetImageBase64 = await encodeImageToBase64(targetImage.file);
    const referenceImagesBase64 = await Promise.all(
      referenceImages.map(img => encodeImageToBase64(img.file))
    );

    const result = await submitMultiImage.mutateAsync({
      targetImageBase64,
      referenceImagesBase64,
      relationshipType: mi.relationshipType,
      contextDescription: mi.contextDescription,
    });

    setAnalysisResult(result);
  } catch (error) {
    conditionalLog('submit-multi-image', { error, config });
  } finally {
    setSubmittingCardId(null);
  }
};
```

### ⏳ 3.6 Create Unified Submit Handler (`app/page.tsx`) - PENDING

Create single handler that routes to technique-specific handlers:

- Create handleCardSubmit(config: PromptCardConfig) function
- Switch on config.technique
- Route to appropriate handler based on technique type
- Handle unknown technique types with error

**Implementation:**

```typescript
const handleCardSubmit = async (config: PromptCardConfig) => {
  switch (config.technique) {
    case 'standard':
      await handleSubmitStandardPrompt(config);
      break;
    case 'few-shot':
      await handleSubmitFewShotPrompt(config);
      break;
    case 'visual-pointing':
      await handleSubmitVisualPointing(config);
      break;
    case 'multi-image':
      await handleSubmitMultiImage(config);
      break;
    default:
      conditionalLog('submit-error', { error: 'Unknown technique type', technique: config.technique });
  }
};
```

### ⏳ 3.7 Wire Handlers to PromptCard Components (`app/page.tsx`) - PENDING

Pass handlers and loading state to all PromptCard components:

- Add onSubmit={handleCardSubmit} prop to each PromptCard
- Add isSubmitting={submittingCardId === card.id} prop to each PromptCard
- Ensure all cards receive the same handler

**Updated Render:**

```typescript
{promptCards.map((card, index) => (
  <div key={card.id}>
    <PromptCard
      config={card}
      onUpdate={(config) => handleCardUpdate(index, config)}
      onAddBelow={() => handleAddCard(index, "below")}
      onDelete={() => handleDeleteCard(index)}
      onSubmit={handleCardSubmit}
      isSubmitting={submittingCardId === card.id}
    />
    {index < promptCards.length - 1 && (
      <InsertCardButton onClick={() => handleAddCard(index, "below")} />
    )}
  </div>
))}
```

## ⏳ Phase 4: Connect Sequence Button to Actual Execution

### ⏳ 4.1 Import Sequence Hook (`app/page.tsx`) - PENDING

Import and initialize sequence submission hook:

- Import useSubmitSequence from ./page.hooks
- Initialize hook: const submitSequence = useSubmitSequence()
- Track sequence execution state

**Import and Init:**

```typescript
import { useSubmitSequence } from "./page.hooks";

const submitSequence = useSubmitSequence();
const [isExecutingSequence, setIsExecutingSequence] = useState(false);
```

### ⏳ 4.2 Implement Sequence Execution Handler (`app/page.tsx`) - PENDING

Replace console.log in handleStartSequence with actual execution:

- Filter valid cards using canSubmitCard validation
- For each valid card, prepare submission data based on technique
- Call submitSequence.mutateAsync with array of card data
- Handle success: display all results
- Handle errors: log and show error toast
- Update sequence execution state

**Implementation:**

```typescript
const handleStartSequence = async () => {
  try {
    setIsExecutingSequence(true);

    const validCards = promptCards.filter(card => canSubmitCard(card));

    if (validCards.length === 0) {
      conditionalLog('sequence-error', { error: 'No valid cards to execute' });
      return;
    }

    const cardsData = await Promise.all(
      validCards.map(async (card) => {
        let data: any;

        switch (card.technique) {
          case 'standard':
            const images = await Promise.all(
              card.assignedImages.map(async (imgId) => {
                const img = uploadedImages.find(i => i.id === imgId);
                if (!img) throw new Error(`Image ${imgId} not found`);
                return {
                  id: img.id,
                  base64: await encodeImageToBase64(img.file),
                };
              })
            );
            data = {
              prompt: card.prompt,
              imageIds: card.assignedImages,
              images,
            };
            break;

          case 'few-shot':
            const fewShot = card.metadata?.fewShot;
            if (!fewShot?.targetImage || !fewShot.exampleImages.length) {
              throw new Error('Missing target image or example images');
            }

            const exampleImagesData = await Promise.all(
              fewShot.exampleImages.map(async (img) => {
                const markedImageDataUrl = await drawCoordinateMarkers(
                  img.preview,
                  img.coordinates
                );

                return {
                  base64: markedImageDataUrl,
                  name: img.name,
                  coordinates: img.coordinates,
                };
              })
            );

            const targetImageBase64 = await encodeImageToBase64(fewShot.targetImage.file);

            data = {
              prompt: card.prompt,
              targetImage: targetImageBase64,
              exampleImages: exampleImagesData,
              subCategory: card.selectedSubCategory || 'counting',
            };
            break;

          case 'visual-pointing':
            const vp = card.metadata?.visualPointing;
            if (!vp?.image || !vp.markups.length) {
              throw new Error('Missing image or markups');
            }

            data = {
              imageId: vp.imageId!,
              imageBase64: await encodeImageToBase64(vp.image.file),
              markups: vp.markups,
            };
            break;

          case 'multi-image':
            const mi = card.metadata?.multiImage;
            if (!mi?.targetImageId || !mi.referenceImageIds.length) {
              throw new Error('Missing target or reference images');
            }

            const targetImage = uploadedImages.find(i => i.id === mi.targetImageId);
            if (!targetImage) throw new Error('Target image not found');

            const referenceImages = mi.referenceImageIds
              .map(id => uploadedImages.find(i => i.id === id))
              .filter((img): img is NonNullable<typeof img> => img !== undefined);

            data = {
              targetImageBase64: await encodeImageToBase64(targetImage.file),
              referenceImagesBase64: await Promise.all(
                referenceImages.map(img => encodeImageToBase64(img.file))
              ),
              relationshipType: mi.relationshipType,
              contextDescription: mi.contextDescription,
            };
            break;
        }

        return {
          technique: card.technique,
          data,
        };
      })
    );

    const results = await submitSequence.mutateAsync({ cards: cardsData });

    conditionalLog('sequence-success', { results });
  } catch (error) {
    conditionalLog('sequence-error', { error });
  } finally {
    setIsExecutingSequence(false);
  }
};
```

### ⏳ 4.3 Update Sequence Button UI (`app/page.tsx`) - PENDING

Add loading state to sequence button:

- Disable button when isExecutingSequence is true
- Show loading spinner during execution
- Update button text to "Executing sequence..."

**Updated Button:**

```typescript
<button
  onClick={handleStartSequence}
  disabled={!canStartSequence() || isExecutingSequence}
  className={cn(
    "flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors",
    canStartSequence() && !isExecutingSequence
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-100 text-gray-400 cursor-not-allowed"
  )}
>
  {isExecutingSequence ? (
    <>
      <span>Executing sequence...</span>
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </>
  ) : (
    <>
      <span>Start sequence</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </>
  )}
</button>
```

## ⏳ Phase 5: Add Results Display UI

### ⏳ 5.1 Update Results State Management (`app/page.tsx`) - PENDING

Enhance results state to support multiple results:

- Change analysisResult to support array of results
- Add cardId tracking to results
- Support displaying multiple results from sequence execution

**Updated State:**

```typescript
interface ResultWithCard {
  cardId?: string;
  result: AnalysisResult;
}

const [analysisResults, setAnalysisResults] = useState<ResultWithCard[]>([]);
```

### ⏳ 5.2 Update Single Card Submit Success Handlers (`app/page.tsx`) - PENDING

Update all submit handlers to store results with card ID:

- Modify handleSubmitStandardPrompt to append to analysisResults
- Modify handleSubmitFewShotPrompt to append to analysisResults
- Modify handleSubmitVisualPointing to append to analysisResults
- Modify handleSubmitMultiImage to append to analysisResults

**Updated Success Handling:**

```typescript
const result = await submitFewShot.mutateAsync({...});

setAnalysisResults(prev => [...prev, {
  cardId: config.id,
  result,
}]);
```

### ⏳ 5.3 Update Sequence Success Handler (`app/page.tsx`) - PENDING

Store all sequence results:

- Map sequence results to analysisResults format
- Clear previous results when starting new sequence
- Display all results in order

**Updated Success Handling:**

```typescript
const results = await submitSequence.mutateAsync({ cards: cardsData });

setAnalysisResults(results.map((result, index) => ({
  cardId: validCards[index].id,
  result,
})));
```

### ⏳ 5.4 Create Results Display Component (`components/AnalysisResults.tsx`) - PENDING

Create new component to display analysis results:

- Accept array of ResultWithCard
- Display each result in expandable card
- Show model, token usage, and result text
- Add copy button for each result
- Add clear all button

**Component Structure:**

```typescript
interface AnalysisResultsProps {
  results: Array<{
    cardId?: string;
    result: {
      result: string;
      usage: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      };
      model: string;
    };
  }>;
  onClear: () => void;
}

export default function AnalysisResults({ results, onClear }: AnalysisResultsProps)
```

### ⏳ 5.5 Integrate Results Display into Page (`app/page.tsx`) - PENDING

Render results below prompt cards:

- Import AnalysisResults component
- Render below prompt cards section
- Pass analysisResults and clear handler
- Only show when results exist

**Render Logic:**

```typescript
{analysisResults.length > 0 && (
  <div className="mt-8">
    <AnalysisResults
      results={analysisResults}
      onClear={() => setAnalysisResults([])}
    />
  </div>
)}
```

## ⏳ Phase 6: Production Build Validation and Testing

### ⏳ 6.1 Add Server-Side Logging (`app/page.actions.ts`) - PENDING

Add debug logging to all server actions:

- Add conditionalLog at start of each action
- Log input parameters (without sensitive data)
- Log success/error outcomes
- Use label: 'action-name' for filtering

**Example:**

```typescript
export const submitFewShotPromptAction = async (
  input: FewShotPromptInput
): Promise<ActionResponse<AnalysisResult>> => {
  conditionalLog('submitFewShotPromptAction', {
    promptLength: input.prompt.length,
    exampleImagesCount: input.exampleImages.length,
    subCategory: input.subCategory,
  });

  try {
    const result = await client.sendImageAnalysis({...});

    conditionalLog('submitFewShotPromptAction-success', {
      model: result.model,
      tokens: result.usage.total_tokens,
    });

    return getActionResponse({ data: {...} });
  } catch (error) {
    conditionalLog('submitFewShotPromptAction-error', { error });
    return getActionResponse({ error });
  }
};
```

### ⏳ 6.2 Run Production Build - PENDING

Validate production build:

- Run npm run build
- Fix any TypeScript errors
- Fix any import errors
- Fix any configuration issues
- Repeat until build succeeds with zero errors

### ⏳ 6.3 End-to-End Testing - PENDING

Perform comprehensive testing:

- Test standard prompt submission with single image
- Test few-shot submission with target + 3 example images with markers
- Verify marker overlay appears on example images sent to API
- Test visual pointing submission
- Test multi-image submission
- Test sequence execution with mixed technique cards
- Verify results display correctly
- Test error handling (missing images, API errors)
- Verify loading states work correctly
- Test with NEXT_PUBLIC_LOG_LABELS="all" to verify server logs

**Test Checklist:**

- [ ] Standard prompt: upload 1 image, enter prompt, submit
- [ ] Few-shot: upload target, upload 3 examples, mark coordinates on each, submit
- [ ] Verify few-shot marked images have red circles with numbers
- [ ] Visual pointing: upload image, add markup, submit
- [ ] Multi-image: upload target and references, submit
- [ ] Sequence: create 3 cards, submit sequence
- [ ] Verify all results display correctly
- [ ] Verify loading spinners appear during submission
- [ ] Verify toast notifications for success/error
- [ ] Verify server logs appear in console

### ⏳ 6.4 Verify Image Marker Implementation - PENDING

Specific validation for marker overlay:

- Create test few-shot card with 4 example images
- Add 5-10 coordinate markers to each example image
- Submit and verify server receives marked images (not original)
- Download/inspect images sent to API to verify red circles are visible
- Verify markers are numbered 1, 2, 3, etc.
- Verify markers appear at correct percentage-based positions

## Implementation Notes

### File Organization

Following CLAUDE.md conventions:

- New utility: lib/fewshot.util.ts
- Updated component: components/PromptCard.tsx
- Updated page: app/page.tsx
- New component: components/AnalysisResults.tsx
- Updated actions: app/page.actions.ts (add logging only)
- No comments in any files
- Use cn from @/lib/shadcn.utils for class concatenation
- Use conditionalLog for all console logging

### Component Patterns

- React Query hooks call actions for data operations
- Loading state managed by react-query isPending
- Zustand stores updated in onSuccess callbacks (if needed)
- Better-auth client methods called directly in hooks
- Prisma queries called in actions via getAuthenticatedClient

### Image Marker Specifications

Visual appearance of coordinate markers:

- Outer circle: 5px white stroke (for visibility on any background)
- Inner circle: 3px red (#EF4444) stroke
- Circle radius: 8px
- Number label: 14px bold white text with 3px black outline
- Numbers start at 1 (not 0)
- Positioned at exact percentage coordinates converted to pixels

### Error Handling

All submission handlers should:

- Wrap in try/catch blocks
- Use conditionalLog for all errors
- Clear submitting state in finally block
- Display user-friendly error toasts via react-query
- Validate all required data before processing

### Logging Strategy

Enable different log levels for debugging:

- NEXT_PUBLIC_LOG_LABELS="all" - See all logs
- NEXT_PUBLIC_LOG_LABELS="submit-fewshot,action" - See specific labels
- Use descriptive labels: submit-{technique}, {action-name}, sequence-{event}
