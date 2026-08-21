'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'auto' | 'light' | 'evening' | 'dark';
export type ResolvedTheme = 'light' | 'evening' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getResolvedThemeFromTime(): ResolvedTheme {
  const hour = new Date().getHours();
  // Morning & Daytime (6 AM to 5 PM): Light
  if (hour >= 6 && hour < 17) {
    return 'light';
  }
  // Evening / Sunset Twilight (5 PM to 8 PM): Evening
  if (hour >= 17 && hour < 20) {
    return 'evening';
  }
  // Night (8 PM to 6 AM): Dark
  return 'dark';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('auto');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  const updateResolvedTheme = useCallback((mode: ThemeMode) => {
    let resolved: ResolvedTheme;
    if (mode === 'auto') {
      resolved = getResolvedThemeFromTime();
    } else {
      resolved = mode;
    }
    setResolvedTheme(resolved);

    // Apply classes to document html/body
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-evening', 'theme-dark', 'dark');

    root.classList.add(`theme-${resolved}`);
    if (resolved === 'dark' || resolved === 'evening') {
      root.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    const saved = (localStorage.getItem('sri_bday_theme') as ThemeMode) || 'auto';
    setThemeState(saved);
    updateResolvedTheme(saved);

    // Check time every 5 minutes if auto
    const interval = setInterval(() => {
      const currentSaved = (localStorage.getItem('sri_bday_theme') as ThemeMode) || 'auto';
      if (currentSaved === 'auto') {
        updateResolvedTheme('auto');
      }
    }, 1000 * 60 * 5);

    return () => clearInterval(interval);
  }, [updateResolvedTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('sri_bday_theme', newTheme);
    updateResolvedTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
