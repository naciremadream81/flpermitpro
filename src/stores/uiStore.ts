import { create } from 'zustand';

const readDarkModeFromStorage = (): boolean =>
  typeof window !== 'undefined' && localStorage.getItem('darkMode') === 'true';

/** Applies saved dark mode to `<html>` before first paint (call from `main.tsx`). */
export function initDarkMode(): void {
  if (typeof window === 'undefined') return;
  const dark = localStorage.getItem('darkMode') === 'true';
  document.documentElement.classList.toggle('dark', dark);
}

interface UiStore {
  sidebarOpen: boolean;
  activeModal: string | null;
  toasts: Toast[];
  darkMode: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  toggleDarkMode: () => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

let toastCounter = 0;

export const useUiStore = create<UiStore>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  toasts: [],
  darkMode: readDarkModeFromStorage(),

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
  addToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: `toast-${++toastCounter}` }],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode;
      localStorage.setItem('darkMode', String(next));
      document.documentElement.classList.toggle('dark', next);
      return { darkMode: next };
    }),
}));
