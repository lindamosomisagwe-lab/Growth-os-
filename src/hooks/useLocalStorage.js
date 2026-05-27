// src/hooks/useLocalStorage.js
import { useState, useEffect } from "react";

/**
 * Hook that synchronises a state value with localStorage.
 * @param {string} key   The storage key.
 * @param {any} defaultValue   Initial value if nothing is stored.
 */
export default function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error("Failed to parse localStorage", e);
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Failed to write to localStorage", e);
    }
  }, [key, value]);

  return [value, setValue];
}
