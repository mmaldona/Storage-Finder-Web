import type { ViewMode } from "@/hooks/useViewMode";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  const next: ViewMode = mode === "list" ? "card" : "list";
  const label = mode === "list" ? "Cards" : "List";
  return (
    <button
      className="flex items-center justify-center px-3 py-3 text-xs font-medium"
      style={{ minWidth: 44, minHeight: 44, color: "#1E6FD9" }}
      onClick={() => onChange(next)}
      aria-label={mode === "list" ? "Switch to Cards view" : "Switch to List view"}
    >
      {label}
    </button>
  );
}
