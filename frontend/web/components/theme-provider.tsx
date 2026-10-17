'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ThemeContextValue = {
  theme: 'dark' | 'light';
  accent: string;
  toggleTheme: () => void;
  setAccent: (value: string) => void;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);
const accents = ['#168c78', '#4888a8', '#b5684f', '#8a7553'];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [accent, setAccentState] = useState(accents[0]!);
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme');
    const savedAccent = localStorage.getItem('portfolio-accent');
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme);
    if (savedAccent && accents.includes(savedAccent)) setAccentState(savedAccent);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.setProperty('--accent', accent);
  }, [theme, accent]);
  const toggleTheme = useCallback(
    () =>
      setTheme((current) => {
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('portfolio-theme', next);
        return next;
      }),
    [],
  );
  const setAccent = useCallback((value: string) => {
    if (accents.includes(value)) {
      setAccentState(value);
      localStorage.setItem('portfolio-accent', value);
    }
  }, []);
  const value = useMemo(
    () => ({ theme, accent, toggleTheme, setAccent }),
    [theme, accent, toggleTheme, setAccent],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider.');
  return context;
}

export { accents };
