import { ReactNode } from "react";

interface CardGridProps {
  children: ReactNode;
}

export function CardGrid({ children }: CardGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 py-3">
      {children}
    </div>
  );
}
