import { create } from 'zustand';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('tookoo-theme') as Theme;
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
  }
  return 'light';
};

const applyThemeToDOM = (theme: Theme): boolean => {
  if (typeof window === 'undefined') return false;

  const root = document.documentElement;
  let isDarkMode = false;

  if (theme === 'system') {
    isDarkMode = Boolean(
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  } else {
    isDarkMode = theme === 'dark';
  }

  if (isDarkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  localStorage.setItem('tookoo-theme', theme);
  return isDarkMode;
};

// Initial run on module import
const initial = getInitialTheme();
const initialIsDark = applyThemeToDOM(initial);

export const useTheme = create<ThemeStore>((set) => ({
  theme: initial,
  isDark: initialIsDark,
  setTheme: (theme: Theme) => {
    const isDark = applyThemeToDOM(theme);
    set({ theme, isDark });
  },
  toggleTheme: () => {
    set((state) => {
      const nextTheme: Theme = state.theme === 'dark' ? 'light' : 'dark';
      const isDark = applyThemeToDOM(nextTheme);
      return { theme: nextTheme, isDark };
    });
  },
}));
