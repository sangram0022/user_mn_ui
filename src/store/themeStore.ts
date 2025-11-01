// Theme Management Store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'system',
      
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },
      
      toggleTheme: () =>
        set((state) => {
          const newTheme = state.theme === 'light' ? 'dark' : 'light';
          applyTheme(newTheme);
          return { theme: newTheme };
        }),
    }),
    {
      name: 'theme-storage',
    }
  )
);

function applyTheme(theme: Theme) {
  const root = window.document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.remove('light', 'dark');
    root.classList.add(systemTheme);
  } else {
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('theme-storage');
  if (storedTheme) {
    try {
      const { state } = JSON.parse(storedTheme);
      applyTheme(state.theme);
    } catch {
      applyTheme('system');
    }
  }
}
