'use client';

import React, { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '../icons';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 1. Inspect existing saved theme in localStorage
    const saved = localStorage.getItem('tl-theme');
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
      return;
    }

    // 2. Fall back to operating system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = prefersDark ? 'dark' : 'light';
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('tl-theme', nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="tl-theme-toggle"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <MoonIcon size={20} aria-hidden="true" />
      ) : (
        <SunIcon size={20} aria-hidden="true" />
      )}
    </button>
  );
};
