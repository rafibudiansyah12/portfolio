'use client';

import { Moon, Sun } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useTheme } from './theme-provider';

export function ThemeControls() {
  const { theme, toggleTheme } = useTheme();
  const locale = useLocale();
  return (
    <div className="theme-controls">
      <button
        className="icon-control"
        type="button"
        onClick={toggleTheme}
        aria-label={
          locale === 'id'
            ? theme === 'dark'
              ? 'Gunakan tema terang'
              : 'Gunakan tema gelap'
            : theme === 'dark'
              ? 'Use light theme'
              : 'Use dark theme'
        }
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </div>
  );
}
