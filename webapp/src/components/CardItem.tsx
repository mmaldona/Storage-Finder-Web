import { ReactNode } from "react";
import { Boxes } from "lucide-react";

export interface CardItemProps {
  name: string;
  subtitle?: string;
  date: string;
  photoUrl?: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export function CardItem({ name, subtitle, date, photoUrl, icon, onClick }: CardItemProps) {
  return (
    <button
      className="flex w-full flex-col overflow-hidden rounded-xl bg-white p-3 shadow-sm text-left transition-transform active:scale-[0.97]"
      onClick={onClick}
    >
      <div className="mb-2 aspect-square w-full flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary">
            {icon ?? <Boxes className="h-6 w-6" />}
          </div>
        )}
      </div>
      <p className="line-clamp-2 break-words text-sm font-bold leading-tight text-foreground">
        {name}
      </p>
      {subtitle ? (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
      ) : null}
      <p className="mt-0.5 text-xs text-muted-foreground/70">{date}</p>
    </button>
  );
}
