# Prompt Card Interface Refactor - Complete Implementation Roadmap

This roadmap details the process to refactor the image analysis interface to focus on prompt cards with enhanced few-shot learning capabilities, removing the global dropzone and implementing a streamlined workflow.

## 🎯 Current Status (Updated: 4-Oct-2025)

### ✅ COMPLETED PHASES

- **Phase 1**: Update type definitions and configuration ✓
  - Removed "multi-step" from TechniqueType
  - Added FewShotSubCategory type
  - Updated PromptCardConfig with selectedSubCategory field
  - Removed selectedTemplate from FewShotConfig
  - Updated TECHNIQUES array with hasSubCategories flag

- **Phase 2**: Refactor PromptCard component structure ✓
  - Replaced card header with technique selector as primary control
  - Added sub-category selector for few-shot technique
  - Removed add above/below buttons from header
  - Added "Insert Card Below" button at card bottom
  - Removed duplicate technique selector from card body

- **Phase 3**: Implement Few-Shot Learning split layout ✓
  - Created two-column split layout for few-shot technique
  - Added target image dropzone in left column below prompt textarea
  - Added example images dropzone in right column (up to 4 images)
  - Implemented 2x2 grid display for example images with coordinate markers
  - Enhanced ImageMarkerSheet with next/previous navigation
  - Added image counter display (e.g., "2 of 4")
  - Auto-save markers when navigating between images
  - Updated FewShotConfig to include targetImage field

- **Phase 4**: Add insert card functionality ✓
  - Created InsertCardButton component with centered plus icon
  - Integrated insert buttons between cards on page
  - Wired up to handleAddCard function with correct index
  - Maintained card ordering and IDs properly
  - Production build validates successfully

### 🔄 IN PROGRESS

- **Phase 5**: Implement submit buttons and sequence controls

### ⏳ REMAINING WORK
- **Phase 5**: Implement submit buttons and sequence controls
- **Phase 6**: Update page layout and remove dropzone
- **Phase 7**: Production build validation

### 🚀 READY TO USE

Current features available:
- Basic prompt card interface with multiple techniques
- Few-shot learning with split layout, target image, and example images grid
- Enhanced ImageMarkerSheet with navigation between example images
- Insert card functionality with buttons between cards
- Image dropzone at page level

### 📍 NEXT STEPS

1. Implement submit single prompt button in each card
2. Add start sequence button at workflow level
3. Create card actions for submission processing
4. Create card hooks for mutation management

## Prerequisites

- ✅ Next.js 15 with App Router
- ✅ TypeScript
- ✅ TailwindCSS v4
- ✅ Existing PromptCard component structure
- ✅ FewShotBuilder component with coordinate marking
- ✅ ImageMarkerSheet component for marker placement

## ✅ Phase 1: Update Type Definitions and Configuration

### ✅ 1.1 Update PromptCard Types ([components/PromptCard.tsx](components/PromptCard.tsx)) - COMPLETED

Update technique types and add sub-category configuration:

- Remove "multi-step" from TechniqueType union
- Add FewShotSubCategory type with options: "counting" | "identification" | "classification"
- Update PromptCardConfig interface to include selectedSubCategory field
- Ensure metadata structure supports sub-category selection for few-shot

**Key Changes Required:**

```typescript
export type TechniqueType = "standard" | "few-shot" | "visual-pointing" | "multi-image";

export type FewShotSubCategory = "counting" | "identification" | "classification";

export interface PromptCardConfig {
  id: string;
  technique: TechniqueType;
  prompt: string;
  assignedImages: string[];
  selectedSubCategory?: FewShotSubCategory;
  metadata?: {
    fewShot?: FewShotConfig;
    visualPointing?: VisualPointingConfig;
    multiImage?: MultiImageConfig;
  };
}
```

### ✅ 1.2 Update FewShotBuilder Types ([components/FewShotBuilder.tsx](components/FewShotBuilder.tsx)) - COMPLETED

Move template configuration to component-level constants:

- Keep TEMPLATES array structure for sub-category options
- Update FewShotConfig interface to remove selectedTemplate (will be managed in parent)
- Ensure ExampleImage interface includes target/example distinction

## ✅ Phase 2: Refactor PromptCard Component Structure

### ✅ 2.1 Update Card Header ([components/PromptCard.tsx](components/PromptCard.tsx)) - COMPLETED

Replace title display with technique selector:

- Remove current header with technique name and description
- Replace with technique select element as primary header control
- Add sub-category select element next to technique selector (conditional rendering)
- Show sub-category selector only when technique has sub-categories (few-shot, visual-pointing, multi-image)
- Remove plus icon buttons from top-right corner
- Keep delete button in header
- Maintain collapse/expand functionality

**Key Methods/Features Required:**

- `handleTechniqueChange(technique)` - Updates technique and initializes metadata
- `handleSubCategoryChange(subCategory)` - Updates selected sub-category
- Conditional rendering logic for sub-category selector

### ✅ 2.2 Add Insert Card Control ([components/PromptCard.tsx](components/PromptCard.tsx)) - COMPLETED

Add button below each card for inserting new cards:

- Create new component or section rendered after card content
- Display plus icon button centered below card
- Button should insert new card immediately below current card
- Update onAddBelow prop usage to trigger from this new button location
- Remove onAddAbove functionality (no longer needed)

### ✅ 2.3 Update Technique Options Array ([components/PromptCard.tsx](components/PromptCard.tsx)) - COMPLETED

Remove multi-step prompting:

- Filter TECHNIQUES array to exclude multi-step option
- Remove MultiStepBuilder import and usage
- Remove multiStep metadata initialization and handling

**Updated TECHNIQUES Array:**

```typescript
const TECHNIQUES = [
  { id: "standard", name: "Standard Prompt", description: "Single image with text prompt" },
  { id: "few-shot", name: "Few-Shot Learning", description: "Examples with labels + target image", hasSubCategories: true },
  { id: "visual-pointing", name: "Visual Pointing", description: "Markup regions on image" },
  { id: "multi-image", name: "Multi-Image Context", description: "Reference images + target" },
];
```

## ✅ Phase 3: Implement Few-Shot Learning Split Layout

### ✅ 3.1 Create Split Layout Structure ([components/PromptCard.tsx](components/PromptCard.tsx)) - COMPLETED

Implement two-column layout for few-shot technique:

- Left column: Prompt textarea above single image dropzone (target image)
- Right column: Example images dropzone (up to 4 images in 2x2 grid)
- Replace current single-column few-shot layout
- Remove FewShotBuilder component usage for few-shot technique
- Maintain standard layout for other techniques

**Layout Structure:**

```typescript
{config.technique === "few-shot" && (
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-4">
      <textarea />
      <DropZone maxImages={1} />
    </div>
    <div>
      <ExampleImagesGrid maxImages={4} />
    </div>
  </div>
)}
```

### ✅ 3.2 Implement Target Image Dropzone ([components/PromptCard.tsx](components/PromptCard.tsx)) - COMPLETED

Create left-side target image upload:

- Single image dropzone below prompt textarea
- Accept one image only (replace if new image uploaded)
- Display preview with remove option
- Store in metadata.fewShot.targetImage
- Validate image present before enabling submit

### ✅ 3.3 Implement Example Images Grid ([components/PromptCard.tsx](components/PromptCard.tsx)) - COMPLETED

Create right-side example images grid:

- 2x2 grid layout for up to 4 images
- Click image to open ImageMarkerSheet
- Store images with coordinates in metadata.fewShot.exampleImages
- Display coordinate count badge on each image
- Enable navigation between images in marker sheet

**Key Methods/Features Required:**

- `handleTargetImageUpload(file)` - Manages single target image
- `handleExampleImageUpload(files)` - Manages up to 4 example images
- `handleOpenMarkerSheet(imageId)` - Opens sheet for coordinate marking
- `handleMarkersSaved(imageId, coordinates)` - Stores marker coordinates

### ✅ 3.4 Enhance ImageMarkerSheet Navigation ([components/ImageMarkerSheet.tsx](components/ImageMarkerSheet.tsx)) - COMPLETED

Add next/previous navigation:

- Add chevron buttons on left and right sides of sheet
- Navigate through all example images in the grid
- Maintain marker state for each image separately
- Auto-save markers when navigating between images
- Display current image index (e.g., "2 of 4")

**Key Methods/Features Required:**

- `handleNextImage()` - Navigate to next example image
- `handlePreviousImage()` - Navigate to previous example image
- `currentImageIndex` state tracking
- Auto-save coordinates on navigation

## ✅ Phase 4: Add Insert Card Functionality

### ✅ 4.1 Create InsertCardButton Component ([components/InsertCardButton.tsx](components/InsertCardButton.tsx)) - COMPLETED

Create reusable button component:

- Display centered plus icon
- Styling: subtle border, hover effect
- Accept onClick handler prop
- Render between prompt cards

**Component Structure:**

```typescript
interface InsertCardButtonProps {
  onClick: () => void;
}

export default function InsertCardButton({ onClick }: InsertCardButtonProps)
```

### ✅ 4.2 Update Page Card Rendering ([app/page.tsx](app/page.tsx)) - COMPLETED

Integrate insert buttons between cards:

- Render InsertCardButton after each PromptCard
- Do not render after last card (redundant with add below on last card)
- Wire up to handleAddCard function with correct index
- Maintain card ordering and IDs properly

## ✅ Phase 5: Implement Submit Buttons and Sequence Controls

### ✅ 5.1 Add Submit Single Prompt Button ([components/PromptCard.tsx](components/PromptCard.tsx)) - PENDING

Add button to bottom-right of each card:

- Button text: "Submit single prompt"
- Send icon on right side of button
- Enable only when card has valid configuration
- Position in card footer area
- Trigger submission for individual card

**Validation Rules:**

- Standard: Has prompt and at least one assigned image
- Few-shot: Has prompt, target image, and at least one example image with markers
- Visual-pointing: Has selected image with markup
- Multi-image: Has target and reference images

**Key Methods/Features Required:**

- `canSubmitCard()` - Validation logic for current card state
- `handleSubmitCard()` - Submit individual card for processing

### ✅ 5.2 Add Start Sequence Button ([app/page.tsx](app/page.tsx)) - PENDING

Add workflow-level control button:

- Position at same level as "Prompt Workflow" title, right-aligned
- Button text: "Start sequence"
- Play icon on right side
- Enable only when at least one card is valid
- Trigger sequential execution of all valid cards

**Key Methods/Features Required:**

- `canStartSequence()` - Check if any cards are valid
- `handleStartSequence()` - Execute cards in order

### ✅ 5.3 Create Card Actions ([app/page.actions.ts](app/page.actions.ts)) - PENDING

Implement server actions for submissions:

- `submitStandardPromptAction(config)` - Process standard prompt
- `submitFewShotPromptAction(config)` - Process few-shot with image marker creation
- `submitVisualPointingAction(config)` - Process visual pointing
- `submitMultiImageAction(config)` - Process multi-image
- `submitSequenceAction(configs)` - Process multiple cards in sequence

**Image Marker Creation:**

- Create copies of example images with visual markers
- Draw markers at provided coordinates
- Return marked image URLs or base64
- Include in API request to vision model

### ✅ 5.4 Create Card Hooks ([app/page.hooks.ts](app/page.hooks.ts)) - PENDING

Implement react-query hooks for submissions:

- `useSubmitStandardPrompt()` - Mutation hook for standard
- `useSubmitFewShotPrompt()` - Mutation hook for few-shot
- `useSubmitVisualPointing()` - Mutation hook for visual pointing
- `useSubmitMultiImage()` - Mutation hook for multi-image
- `useSubmitSequence()` - Mutation hook for sequence execution
- Handle loading states, errors, and success responses
- Update analysis results in page state

## ✅ Phase 6: Update Page Layout and Remove Dropzone

### ✅ 6.1 Remove Global Dropzone Section ([app/page.tsx](app/page.tsx)) - PENDING

Clean up page-level image upload:

- Remove "AI Image Analysis Workflow" section and title
- Remove DropZone component from page level
- Remove uploadedImages state management from page
- Remove handleImagesUploaded, handleRemoveImage, handleReorderImages functions
- Remove images prop passed to PromptCard components

### ✅ 6.2 Update Page Header ([app/page.tsx](app/page.tsx)) - PENDING

Simplify header section:

- Update "Prompt Workflow" title section
- Add "Start sequence" button to right side of title
- Remove image upload instructions
- Maintain clean, focused layout

### ✅ 6.3 Update Workflow Title Section ([app/page.tsx](app/page.tsx)) - PENDING

Create flex container for title and button:

- Left: "Prompt Workflow" title
- Right: "Start sequence" button with play icon
- Ensure responsive layout
- Maintain consistent spacing

**Layout Structure:**

```typescript
<div className="flex items-center justify-between mb-4">
  <h2 className="text-xl font-semibold text-gray-900">Prompt Workflow</h2>
  <button onClick={handleStartSequence} disabled={!canStartSequence()}>
    Start sequence
    <PlayIcon />
  </button>
</div>
```

## ✅ Phase 7: Production Build Validation

### ✅ 7.1 Run Production Build - PENDING

Validate production build:

- Run `npm run build`
- Fix any TypeScript errors
- Fix any import errors
- Fix any configuration issues
- Repeat until build succeeds with zero errors and warnings

### ✅ 7.2 Manual Testing - PENDING

Perform end-to-end testing:

- Test each technique type
- Test few-shot with image uploads and markers
- Test card insertion and deletion
- Test single card submission
- Test sequence submission
- Test error handling and validation
- Verify responsive design across breakpoints

## Implementation Notes

### File Organization

Following CLAUDE.md conventions:

- Types in [components/PromptCard.tsx](components/PromptCard.tsx)
- Actions in [app/page.actions.ts](app/page.actions.ts)
- Hooks in [app/page.hooks.ts](app/page.hooks.ts)
- No comments in any files
- Use `cn` from `@/lib/shadcn.utils` for class concatenation
- Use `conditionalLog` for all console logging

### Component Patterns

- React Query hooks call actions for data operations
- Zustand stores updated in onSuccess callbacks
- Loading/error state managed by react-query, not stores
- Better-auth client methods called directly in hooks
- Prisma queries called in actions via getAuthenticatedClient

### Sub-Category Selection

Techniques with sub-categories:

- **Few-shot**: counting, identification, classification
- **Visual-pointing**: Could add region types (future)
- **Multi-image**: Could add comparison types (future)

Only show sub-category selector when technique has sub-categories defined.

### Image Marker Creation

For few-shot submission:

- Create server-side image processing function
- Use canvas or image manipulation library
- Draw visible markers at coordinate positions
- Export as new image files or base64
- Include marked images in vision API request
- Store original and marked image references

### Validation Logic

Card can be submitted when:

- **Standard**: `prompt.length > 0 && assignedImages.length > 0`
- **Few-shot**: `prompt.length > 0 && targetImage !== null && exampleImages.length > 0 && exampleImages.every(img => img.coordinates.length > 0)`
- **Visual-pointing**: `imageId !== null && markups.length > 0`
- **Multi-image**: `targetImageId !== null && referenceImageIds.length > 0`

Sequence can start when:

- At least one card passes validation
- Process only valid cards in sequence
- Skip invalid cards with warning
