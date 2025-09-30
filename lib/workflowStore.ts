import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TechniqueType = 'standard' | 'few-shot' | 'multi-step' | 'visual-pointing' | 'multi-image';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  thumbnail: string;
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
    name: string;
  };
  usedInCards: string[];
}

export interface ResponseData {
  text: string;
  structuredData: Record<string, unknown> | null;
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  timestamp: number;
  summary: string;
  keyFindings: string[];
}

export interface PromptCard {
  id: string;
  technique: TechniqueType;
  config: TechniqueConfig;
  assignedImages: string[];
  response: ResponseData | null;
  order: number;
}

export type TechniqueConfig =
  | StandardConfig
  | FewShotConfig
  | MultiStepConfig
  | VisualPointingConfig
  | MultiImageConfig;

export interface StandardConfig {
  type: 'standard';
  prompt: string;
  image?: string;
}

export interface FewShotConfig {
  type: 'few-shot';
  examples: Array<{
    image: string;
    label: string;
  }>;
  targetImage: string;
  prompt: string;
}

export interface MultiStepConfig {
  type: 'multi-step';
  steps: string[];
  image: string;
  prompt?: string;
}

export interface VisualPointingConfig {
  type: 'visual-pointing';
  image: string;
  markup: Array<{
    id: string;
    type: 'circle' | 'rectangle' | 'arrow' | 'text';
    color: string;
    data: Record<string, unknown>;
  }>;
  prompt: string;
}

export interface MultiImageConfig {
  type: 'multi-image';
  referenceImages: string[];
  targetImage: string;
  relationshipType: 'comparison' | 'reference' | 'example' | 'context';
  contextDescription: string;
  prompt: string;
}

export interface Workflow {
  id: string;
  name: string;
  cards: PromptCard[];
  currentIndex: number;
  createdAt: number;
  updatedAt: number;
}

interface WorkflowState {
  workflow: Workflow | null;
  addPromptCard: (position: number, technique: TechniqueType) => void;
  removePromptCard: (id: string) => void;
  reorderPromptCards: (fromIndex: number, toIndex: number) => void;
  updateCardConfig: (id: string, config: TechniqueConfig) => void;
  assignImagesToCard: (cardId: string, imageIds: string[]) => void;
  storeResponse: (cardId: string, response: ResponseData) => void;
  getSequenceContext: (cardId: string) => ResponseData[];
  setCurrentIndex: (index: number) => void;
  createWorkflow: (name: string) => void;
  loadWorkflow: (workflow: Workflow) => void;
  saveWorkflow: () => void;
  clearWorkflow: () => void;
  updateWorkflowName: (name: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

const createDefaultConfig = (technique: TechniqueType): TechniqueConfig => {
  switch (technique) {
    case 'standard':
      return { type: 'standard', prompt: '' };
    case 'few-shot':
      return { type: 'few-shot', examples: [], targetImage: '', prompt: '' };
    case 'multi-step':
      return { type: 'multi-step', steps: [''], image: '', prompt: '' };
    case 'visual-pointing':
      return { type: 'visual-pointing', image: '', markup: [], prompt: '' };
    case 'multi-image':
      return { type: 'multi-image', referenceImages: [], targetImage: '', relationshipType: 'comparison', contextDescription: '', prompt: '' };
    default:
      return { type: 'standard', prompt: '' };
  }
};

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflow: null,

      createWorkflow: (name: string) => {
        const newWorkflow: Workflow = {
          id: generateId(),
          name,
          cards: [],
          currentIndex: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set({ workflow: newWorkflow });
      },

      loadWorkflow: (workflow: Workflow) => {
        set({ workflow });
      },

      saveWorkflow: () => {
        set((state) => {
          if (!state.workflow) return state;
          return {
            workflow: {
              ...state.workflow,
              updatedAt: Date.now(),
            },
          };
        });
      },

      clearWorkflow: () => {
        set({ workflow: null });
      },

      updateWorkflowName: (name: string) => {
        set((state) => {
          if (!state.workflow) return state;
          return {
            workflow: {
              ...state.workflow,
              name,
              updatedAt: Date.now(),
            },
          };
        });
      },

      addPromptCard: (position: number, technique: TechniqueType) => {
        set((state) => {
          if (!state.workflow) {
            const newWorkflow: Workflow = {
              id: generateId(),
              name: 'Untitled Workflow',
              cards: [],
              currentIndex: 0,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            state = { ...state, workflow: newWorkflow };
          }

          const newCard: PromptCard = {
            id: generateId(),
            technique,
            config: createDefaultConfig(technique),
            assignedImages: [],
            response: null,
            order: position,
          };

          const cards = [...(state.workflow?.cards || [])];
          cards.splice(position, 0, newCard);

          cards.forEach((card, index) => {
            card.order = index;
          });

          return {
            workflow: state.workflow ? {
              ...state.workflow,
              cards,
              updatedAt: Date.now(),
            } : null,
          };
        });
      },

      removePromptCard: (id: string) => {
        set((state) => {
          if (!state.workflow) return state;

          const cards = state.workflow.cards.filter((card) => card.id !== id);

          cards.forEach((card, index) => {
            card.order = index;
          });

          return {
            workflow: {
              ...state.workflow,
              cards,
              currentIndex: Math.min(state.workflow.currentIndex, Math.max(0, cards.length - 1)),
              updatedAt: Date.now(),
            },
          };
        });
      },

      reorderPromptCards: (fromIndex: number, toIndex: number) => {
        set((state) => {
          if (!state.workflow) return state;

          const cards = [...state.workflow.cards];
          const [movedCard] = cards.splice(fromIndex, 1);
          cards.splice(toIndex, 0, movedCard);

          cards.forEach((card, index) => {
            card.order = index;
          });

          return {
            workflow: {
              ...state.workflow,
              cards,
              updatedAt: Date.now(),
            },
          };
        });
      },

      updateCardConfig: (id: string, config: TechniqueConfig) => {
        set((state) => {
          if (!state.workflow) return state;

          const cards = state.workflow.cards.map((card) =>
            card.id === id ? { ...card, config } : card
          );

          return {
            workflow: {
              ...state.workflow,
              cards,
              updatedAt: Date.now(),
            },
          };
        });
      },

      assignImagesToCard: (cardId: string, imageIds: string[]) => {
        set((state) => {
          if (!state.workflow) return state;

          const cards = state.workflow.cards.map((card) =>
            card.id === cardId ? { ...card, assignedImages: imageIds } : card
          );

          return {
            workflow: {
              ...state.workflow,
              cards,
              updatedAt: Date.now(),
            },
          };
        });
      },

      storeResponse: (cardId: string, response: ResponseData) => {
        set((state) => {
          if (!state.workflow) return state;

          const cards = state.workflow.cards.map((card) =>
            card.id === cardId ? { ...card, response } : card
          );

          return {
            workflow: {
              ...state.workflow,
              cards,
              updatedAt: Date.now(),
            },
          };
        });
      },

      getSequenceContext: (cardId: string) => {
        const state = get();
        if (!state.workflow) return [];

        const cardIndex = state.workflow.cards.findIndex((card) => card.id === cardId);
        if (cardIndex === -1) return [];

        const previousCards = state.workflow.cards.slice(0, cardIndex);
        return previousCards
          .filter((card) => card.response !== null)
          .map((card) => card.response!);
      },

      setCurrentIndex: (index: number) => {
        set((state) => {
          if (!state.workflow) return state;

          return {
            workflow: {
              ...state.workflow,
              currentIndex: Math.max(0, Math.min(index, state.workflow.cards.length - 1)),
            },
          };
        });
      },
    }),
    {
      name: 'workflow-storage',
      partialize: (state) => ({ workflow: state.workflow }),
    }
  )
);