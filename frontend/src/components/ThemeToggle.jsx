
import React, { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setIsDark(v => !v)}
      className="p-2 rounded-md hover:bg-sky-accent/10 transition"
      title={isDark ? 'Switch to light' : 'Switch to dark'}
    >
      {isDark ? (
        <span className="text-sky-accent font-medium">🌙 Dark</span>
      ) : (
        <span className="text-sky-accent font-medium">☀️ Light</span>
      )}
    </button>
  );
}
