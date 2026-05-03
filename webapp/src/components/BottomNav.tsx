import { NavLink } from "react-router-dom";
import { Boxes, Search, QrCode, PlusSquare, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Tab {
  to: string;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { to: "/", label: "Home", icon: Boxes },
  { to: "/search", label: "Search", icon: Search },
  { to: "/scan", label: "Scan QR", icon: QrCode },
  { to: "/add", label: "Add Item", icon: PlusSquare },
  { to: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <ul className="mx-auto flex max-w-2xl items-stretch justify-between px-1 pb-[env(safe-area-inset-bottom)]">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform",
                      isActive && "scale-110"
                    )}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
