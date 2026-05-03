import { useState } from "react";

export type ViewMode = "list" | "card";

export function useViewMode(screenId: string): [ViewMode, (mode: ViewMode) => void] {
  const storageKey = `storagefinder_viewmode_${screenId}`;
  const [mode, setMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved === "card" ? "card" : "list";
  });

  function update(newMode: ViewMode) {
    setMode(newMode);
    localStorage.setItem(storageKey, newMode);
  }

  return [mode, update];
}
