import { useRef, useState, useEffect, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const REVEAL_WIDTH = 128;

interface SwipeableRowProps {
  children: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  deleteName: string;
}

export function SwipeableRow({ children, onEdit, onDelete, deleteName }: SwipeableRowProps) {
  const [offset, setOffset] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const startXRef = useRef(0);
  const initialOffsetRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (
        offset !== 0 &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setAnimating(true);
        setOffset(0);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [offset]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    initialOffsetRef.current = offset;
    isDraggingRef.current = true;
    setAnimating(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const delta = e.touches[0].clientX - startXRef.current;
    const newOffset = Math.max(-REVEAL_WIDTH, Math.min(0, initialOffsetRef.current + delta));
    setOffset(newOffset);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setAnimating(true);
    if (offset < -(REVEAL_WIDTH / 2)) {
      setOffset(-REVEAL_WIDTH);
    } else {
      setOffset(0);
    }
  };

  const closeSwipe = () => {
    setAnimating(true);
    setOffset(0);
  };

  const handleContentClick = () => {
    if (offset !== 0) {
      closeSwipe();
    }
  };

  return (
    <>
      <div ref={containerRef} className="relative overflow-hidden">
        {/* Action buttons revealed from the right */}
        <div
          className="absolute inset-y-0 right-0 flex"
          style={{ width: REVEAL_WIDTH, zIndex: 0 }}
        >
          <button
            onClick={() => {
              closeSwipe();
              onEdit();
            }}
            className="flex flex-1 items-center justify-center text-sm font-semibold text-white"
            style={{ backgroundColor: "#F59E0B" }}
          >
            Edit
          </button>
          <button
            onClick={() => {
              closeSwipe();
              setShowConfirm(true);
            }}
            className="flex flex-1 items-center justify-center text-sm font-semibold text-white"
            style={{ backgroundColor: "#EF4444" }}
          >
            Delete
          </button>
        </div>

        {/* Sliding row content */}
        <div
          style={{
            transform: `translateX(${offset}px)`,
            transition: animating ? "transform 0.2s ease" : "none",
            backgroundColor: "white",
            position: "relative",
            zIndex: 1,
            willChange: "transform",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={offset !== 0 ? handleContentClick : undefined}
        >
          {children}
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteName}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be moved to Recently Deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
