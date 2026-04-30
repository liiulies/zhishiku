import { create } from 'zustand';
import type { Message, UploadStatus } from '@/types';
import { generateId } from '@/lib/utils';

interface AppState {
  // 文本输入
  textContent: string;
  uploadStatus: UploadStatus;
  
  // 对话
  messages: Message[];
  isInputVisible: boolean;
  
  // 全局状态
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTextInput: (text: string) => void;
  setUploadStatus: (status: UploadStatus) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  setInputVisible: (visible: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  textContent: '',
  uploadStatus: 'empty' as UploadStatus,
  messages: [] as Message[],
  isInputVisible: false,
  isLoading: false,
  error: null,
};

export const useStore = create<AppState>()((set) => ({
  ...initialState,

  setTextInput: (text: string) =>
    set((state) => ({
      textContent: text,
      uploadStatus: text.trim() ? 'ready' : state.uploadStatus === 'empty' ? 'empty' : state.uploadStatus,
    })),

  setUploadStatus: (status: UploadStatus) => set({ uploadStatus: status }),

  addMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (id: string, updates: Partial<Message>) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    })),

  clearMessages: () =>
    set({
      messages: [
        {
          id: generateId('welcome'),
          role: 'assistant',
          content: '对话已清空，你可以继续提问。',
          timestamp: new Date(),
          status: 'sent',
        },
      ],
    }),

  setInputVisible: (visible: boolean) => set({ isInputVisible: visible }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  setError: (error: string | null) => set({ error }),

  reset: () => set(initialState),
}));
