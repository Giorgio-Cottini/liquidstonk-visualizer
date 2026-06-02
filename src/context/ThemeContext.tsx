import { createContext, useContext, useState, useEffect } from 'react';

interface ThemeCtx { isDark: boolean; toggle: () => void; }
const ThemeContext = createContext<ThemeCtx>({ isDark: false, toggle: () => {} });

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(systemDark);
  // false = following OS; true = user manually picked a preference.
  const [isManual, setIsManual] = useState(false);

  // Sync CSS class on every change.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  // Follow OS changes only when user hasn't manually toggled.
  useEffect(() => {
    if (isManual) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [isManual]);

  const toggle = () => {
    setIsManual(true);
    setIsDark(d => !d);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
