"use client";

import { Moon, Sun } from "lucide-react";

import styles from "./ThemeToggle.module.css";

const STORAGE_KEY = "elvan-theme";

export function ThemeToggle() {
  function toggleTheme() {
    const explicitTheme = document.documentElement.dataset.theme;
    const currentTheme =
      explicitTheme === "light" || explicitTheme === "dark"
        ? explicitTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <Sun className={styles.sunIcon} size={18} aria-hidden="true" />
      <Moon className={styles.moonIcon} size={18} aria-hidden="true" />
    </button>
  );
}
