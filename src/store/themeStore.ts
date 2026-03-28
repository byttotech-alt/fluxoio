import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeMode } from '@/types/database';

interface ThemeState {
  mode: ThemeMode;
  accentColor: string;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccentColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      accentColor: '#6C63FF',
      setMode: (mode) => {
        set({ mode });
        applyTheme(mode, get().accentColor);
      },
      toggleMode: () => {
        const newMode = get().mode === 'dark' ? 'light' : 'dark';
        set({ mode: newMode });
        applyTheme(newMode, get().accentColor);
      },
      setAccentColor: (accentColor) => {
        set({ accentColor });
        applyTheme(get().mode, accentColor);
      },
    }),
    {
      name: 'fluxio-theme',
    }
  )
);

function applyTheme(mode: ThemeMode, accentColor: string) {
  const root = document.documentElement;
  root.setAttribute('data-theme', mode);
  root.style.setProperty('--accent-color', accentColor);
  
  // Derive accent variants
  root.style.setProperty('--accent-color-hover', accentColor + 'dd');
  root.style.setProperty('--accent-color-muted', accentColor + '33');
}

// Apply theme on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('fluxio-theme');
  if (stored) {
    try {
      const { state } = JSON.parse(stored);
      applyTheme(state.mode || 'dark', state.accentColor || '#6C63FF');
    } catch {
      applyTheme('dark', '#6C63FF');
    }
  } else {
    applyTheme('dark', '#6C63FF');
  }
}
