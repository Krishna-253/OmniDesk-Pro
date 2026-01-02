"use client";

import { useEffect, useState } from "react";

const THEMES = {
  dark: {
    "--bg": "#0f0f0f",
    "--text": "#f5f5f5",
    "--card-bg": "#161616",
    "--card-border": "#222",
    "--muted": "#aaa",
    "--link": "#9cdcfe",
  },
  light: {
    "--bg": "#f7f7f7",
    "--text": "#111111",
    "--card-bg": "#ffffff",
    "--card-border": "#e6e6e6",
    "--muted": "#666666",
    "--link": "#0366d6",
  },
};

export default function ThemeToggle() {
  const [theme, setTheme] = useState("dark");

  // apply CSS variable map to :root
  const applyTheme = (t) => {
    const map = THEMES[t] || THEMES.dark;
    Object.entries(map).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("omni-theme", t);
  };

  useEffect(() => {
    const saved = localStorage.getItem("omni-theme");
    const initial = saved || "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      style={{
        marginLeft: "auto",
        padding: "6px 10px",
        borderRadius: 6,
        border: "1px solid var(--card-border)",
        background: "var(--card-bg)",
        color: "var(--text)",
        cursor: "pointer",
      }}
    >
      {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
    </button>
  );
}
