import { Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export interface StorageRowProps {
  description: string;
  subtitle?: string;
  date: string;
  photoUrl?: string;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function StorageRow({
  description,
  subtitle,
  date,
  photoUrl,
  icon,
  onClick,
  className,
}: StorageRowProps) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 px-4 py-3",
        "border-b border-border bg-background text-left",
        "transition-colors hover:bg-secondary/60 active:bg-secondary",
        className
      )}
    >
      <div className="h-14 w-14 flex-none overflow-hidden rounded-xl bg-secondary">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary">
            {icon ?? <Boxes className="h-6 w-6" />}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <p className="truncate text-base font-semibold text-foreground">
          {description}
        </p>
        {subtitle ? (
          <p className="truncate text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
        <p className="truncate text-xs text-muted-foreground/70">{date}</p>
      </div>
    </Comp>
  );
}
