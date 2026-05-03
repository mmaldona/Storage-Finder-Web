import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { QrCode, Plus, Search, Package } from "lucide-react";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";

const QrPrintIcon = ({ size = 24, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="6" height="6" stroke={color} strokeWidth="2" rx="1" />
    <rect x="15" y="3" width="6" height="6" stroke={color} strokeWidth="2" rx="1" />
    <rect x="3" y="15" width="6" height="6" stroke={color} strokeWidth="2" rx="1" />
    <rect x="11" y="11" width="2" height="2" fill={color} />
    <rect x="15" y="11" width="2" height="2" fill={color} />
    <rect x="11" y="15" width="2" height="2" fill={color} />
    <rect x="13" y="16" width="8" height="5" stroke={color} strokeWidth="2" rx="1" />
    <rect x="14" y="14" width="6" height="3" stroke={color} strokeWidth="2" rx="1" />
    <rect x="15" y="18" width="4" height="2" fill={color} />
  </svg>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type IconComponent = React.ComponentType<any>;

interface SpeedDialOption {
  icon: IconComponent;
  label: string;
  action: () => void;
}

interface FABConfig {
  icon: IconComponent;
  onTap: () => void;
  options: SpeedDialOption[];
}

const HIDDEN_ROUTE_PATTERNS = [
  /^\/new-space$/,
  /^\/space\/[^/]+\/new-shelf$/,
  /^\/space\/[^/]+\/shelf\/[^/]+\/new-item$/,
  /^\/space\/[^/]+\/shelf\/[^/]+\/add-item-choice$/,
  /^\/space\/[^/]+\/shelf\/[^/]+\/item\/[^/]+\/edit$/,
  /^\/space\/[^/]+\/edit$/,
  /^\/space\/[^/]+\/shelf\/[^/]+\/edit$/,
  /^\/location\/[^/]+\/edit$/,
  /^\/location\/[^/]+\/new-location$/,
];

const FAB_SIZE = 62;
const ICON_BTN_SIZE = 52;
// Centers the 52px icon buttons horizontally over the 62px FAB
const ICON_OFFSET = (FAB_SIZE - ICON_BTN_SIZE) / 2;

export function FAB() {
  const navigate = useNavigate();
  const location = useLocation();
  const { locations } = useStorageSpaces();
  const [isOpen, setIsOpen] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldRef = useRef(false);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const pathname = location.pathname;
  const isHidden = HIDDEN_ROUTE_PATTERNS.some((p) => p.test(pathname));
  const locationMatch = pathname.match(/^\/location\/([^/]+)$/);
  const locationId = locationMatch?.[1] ?? null;

  const close = useCallback(() => setIsOpen(false), []);

  const locData = locationId ? locations.find((l) => l.id === locationId) : null;
  const spaceId = locData?.parentId ?? locData?.id;
  const shelfId = locData?.id;

  const config: FABConfig = locationId
    ? {
        icon: Plus,
        onTap: () => navigate(`/location/${locationId}/new-location`),
        options: [
          {
            icon: Search,
            label: "Search",
            action: () => { close(); navigate("/search"); },
          },
          {
            icon: QrCode,
            label: "Scan QR",
            action: () => { close(); navigate("/scan"); },
          },
          {
            icon: Package,
            label: "Add Item",
            action: () => {
              close();
              if (spaceId && shelfId) {
                navigate(`/space/${spaceId}/shelf/${shelfId}/add-item-choice`);
              } else {
                navigate("/add");
              }
            },
          },
          {
            icon: QrPrintIcon,
            label: "Generate QR",
            action: () => { close(); navigate("/generate-qr"); },
          },
        ],
      }
    : {
        icon: QrCode,
        onTap: () => navigate("/scan"),
        options: [
          {
            icon: Search,
            label: "Search",
            action: () => { close(); navigate("/search"); },
          },
          {
            icon: Package,
            label: "Add Item",
            action: () => { close(); navigate("/add"); },
          },
          {
            icon: QrPrintIcon,
            label: "Generate QR",
            action: () => { close(); navigate("/generate-qr"); },
          },
        ],
      };

  const clearTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(() => {
    if (isOpen) return;
    isHoldRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      isHoldRef.current = true;
      setIsOpen(true);
    }, 500);
  }, [isOpen]);

  const handlePointerUp = useCallback(() => {
    clearTimer();
    if (!isHoldRef.current) {
      if (isOpen) {
        setIsOpen(false);
      } else {
        config.onTap();
      }
    }
  }, [isOpen, clearTimer, config]);

  if (isHidden) return null;

  const DefaultIcon = config.icon;

  return (
    <>
      {/* Dimmed overlay — tap to dismiss */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: "rgba(0,0,0,0.2)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.15s ease",
        }}
        onClick={close}
      />

      <div className="fixed z-50" style={{ bottom: 28, right: 24 }}>
        {/* Vertical speed dial stack — options[0] at bottom, last at top */}
        <div
          style={{
            position: "absolute",
            bottom: FAB_SIZE + 20,
            right: ICON_OFFSET,
            display: "flex",
            flexDirection: "column-reverse",
            gap: 20,
            alignItems: "flex-end",
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          {config.options.map((opt, i) => {
            const delay = i * 0.06;
            const Ico = opt.icon;
            return (
              <button
                key={i}
                onClick={opt.action}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minHeight: 60,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  opacity: isOpen ? 1 : 0,
                  transform: isOpen ? "translateY(0px)" : "translateY(20px)",
                  transition: isOpen
                    ? `opacity 0.14s ease ${delay}s, transform 0.14s cubic-bezier(0.34,1.56,0.64,1) ${delay}s`
                    : "opacity 0.12s ease, transform 0.12s ease",
                }}
              >
                <span
                  style={{
                    color: "#1a1a1a",
                    fontSize: 15,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    textShadow: "0 1px 3px rgba(255,255,255,0.8)",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                  } as React.CSSProperties}
                >
                  {opt.label}
                </span>
                <div
                  style={{
                    width: ICON_BTN_SIZE,
                    height: ICON_BTN_SIZE,
                    borderRadius: "50%",
                    backgroundColor: "white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Ico size={22} color="#1E6FD9" />
                </div>
              </button>
            );
          })}
        </div>

        {/* FAB — unchanged */}
        <button
          className="flex h-[62px] w-[62px] select-none items-center justify-center rounded-full"
          style={{
            backgroundColor: "#1E6FD9",
            boxShadow: "0 4px 16px rgba(30,111,217,0.45)",
          }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={clearTimer}
          onPointerCancel={clearTimer}
        >
          <div
            style={{
              transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
              transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <DefaultIcon size={28} color="white" />
          </div>
        </button>
      </div>
    </>
  );
}
