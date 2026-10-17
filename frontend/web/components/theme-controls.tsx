'use client';

import { Moon, Sun } from 'lucide-react';
import { accents, useTheme } from './theme-provider';

export function ThemeControls() {
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  return (
    <div className="theme-controls" aria-label="Pengaturan tampilan">
      <div className="accent-picker" aria-label="Warna aksen">
        {accents.map((color) => (
          <button
            key={color}
            className={accent === color ? 'active' : ''}
            style={{ '--swatch': color } as React.CSSProperties}
            onClick={() => setAccent(color)}
            aria-label={`Pilih warna aksen ${color}`}
          />
        ))}
      </div>
      <button
        className="icon-control"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Gunakan tema terang' : 'Gunakan tema gelap'}
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </div>
  );
}
