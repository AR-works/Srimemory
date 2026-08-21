'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from './ThemeContext';
import { Sun, Sunset, Moon, Clock, ChevronDown, Check } from 'lucide-react';

const THEME_OPTIONS: Array<{
  mode: ThemeMode;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}> = [
  {
    mode: 'auto',
    label: 'Auto (Time-based)',
    sublabel: 'Adapts to sun & time of day',
    icon: <Clock className="w-4 h-4 text-purple-500" />,
  },
  {
    mode: 'light',
    label: 'Light Lavender',
    sublabel: 'Soft daytime glow',
    icon: <Sun className="w-4 h-4 text-amber-500" />,
  },
  {
    mode: 'evening',
    label: 'Evening Twilight',
    sublabel: 'Sunset golden-purple',
    icon: <Sunset className="w-4 h-4 text-rose-500" />,
  },
  {
    mode: 'dark',
    label: 'Velvet Night',
    sublabel: 'Deep starry amethyst',
    icon: <Moon className="w-4 h-4 text-indigo-400" />,
  },
];

export const ThemeToggle: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentIcon =
    resolvedTheme === 'light' ? (
      <Sun className="w-3.5 h-3.5 text-amber-500" />
    ) : resolvedTheme === 'evening' ? (
      <Sunset className="w-3.5 h-3.5 text-rose-500" />
    ) : (
      <Moon className="w-3.5 h-3.5 text-indigo-400" />
    );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/70 dark:bg-purple-900/60 theme-evening:bg-amber-950/40 hover:bg-white border border-purple-200/70 dark:border-purple-700/60 shadow-soft-sm backdrop-blur-md transition-all cursor-pointer text-purple-900 dark:text-purple-100 theme-evening:text-amber-100"
        title="Change theme mode"
      >
        {currentIcon}
        <span className="capitalize">{theme === 'auto' ? `Auto (${resolvedTheme})` : theme}</span>
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 p-1.5 bg-white/95 dark:bg-purple-950/95 theme-evening:bg-[#251329]/95 rounded-2xl shadow-xl border border-purple-100 dark:border-purple-800/80 theme-evening:border-amber-900/40 backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 text-purple-400 dark:text-purple-400">
            Select Atmosphere
          </div>
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              onClick={() => {
                setTheme(opt.mode);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                theme === opt.mode
                  ? 'bg-purple-100/80 dark:bg-purple-900/80 theme-evening:bg-amber-900/40 text-purple-950 dark:text-purple-50 font-semibold'
                  : 'hover:bg-purple-50/70 dark:hover:bg-purple-900/40 theme-evening:hover:bg-amber-950/30 text-purple-900 dark:text-purple-200'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-1 rounded-lg bg-purple-50 dark:bg-purple-900/60">
                  {opt.icon}
                </div>
                <div>
                  <div className="text-xs font-medium leading-tight">{opt.label}</div>
                  <div className="text-[10px] text-purple-500/70 dark:text-purple-400/70 font-normal">
                    {opt.sublabel}
                  </div>
                </div>
              </div>
              {theme === opt.mode && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
