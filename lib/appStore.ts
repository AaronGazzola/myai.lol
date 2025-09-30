import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
  timestamp: number;
}

interface AppState {
  apiKey: string | null;
  selectedModel: string;
  isProcessing: boolean;
  dropZoneVisible: boolean;
  sidebarOpen: boolean;
  notifications: Notification[];
  workflowRunning: boolean;
  currentCardProcessing: string | null;
  setApiKey: (key: string | null) => void;
  setSelectedModel: (model: string) => void;
  setProcessingState: (isProcessing: boolean) => void;
  toggleDropZone: (visible: boolean) => void;
  toggleSidebar: () => void;
  addNotification: (message: string, type: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  startWorkflowExecution: () => void;
  pauseWorkflowExecution: () => void;
  setCurrentCardProcessing: (cardId: string | null) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      apiKey: null,
      selectedModel: 'openai/gpt-4o',
      isProcessing: false,
      dropZoneVisible: false,
      sidebarOpen: false,
      notifications: [],
      workflowRunning: false,
      currentCardProcessing: null,

      setApiKey: (key: string | null) => {
        set({ apiKey: key });
      },

      setSelectedModel: (model: string) => {
        set({ selectedModel: model });
      },

      setProcessingState: (isProcessing: boolean) => {
        set({ isProcessing });
        if (!isProcessing) {
          set({ currentCardProcessing: null });
        }
      },

      toggleDropZone: (visible: boolean) => {
        set({ dropZoneVisible: visible });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      addNotification: (message: string, type: NotificationType, duration: number = 5000) => {
        const notification: Notification = {
          id: generateId(),
          type,
          message,
          duration,
          timestamp: Date.now(),
        };

        set((state) => ({
          notifications: [...state.notifications, notification],
        }));

        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(notification.id);
          }, duration);
        }
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      startWorkflowExecution: () => {
        set({ workflowRunning: true });
      },

      pauseWorkflowExecution: () => {
        set({ workflowRunning: false, currentCardProcessing: null });
      },

      setCurrentCardProcessing: (cardId: string | null) => {
        set({ currentCardProcessing: cardId });
      },
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({
        apiKey: state.apiKey,
        selectedModel: state.selectedModel,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);