"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "fold-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      data-theme={theme}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      <span className="theme-toggle__track">
        <span className="theme-toggle__knob" />
      </span>
      <span className="theme-toggle__label" suppressHydrationWarning>
        {theme === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );
}
