import { useRef, useState } from "react";
import { Camera, X } from "lucide-react";

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 600;
      let { width, height } = img;
      if (width > height && width > MAX) {
        height = Math.round((height * MAX) / width);
        width = MAX;
      } else if (height > MAX) {
        width = Math.round((width * MAX) / height);
        height = MAX;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.src = url;
  });
}

interface PhotoFieldProps {
  value: string | null;
  onChange: (photo: string | null) => void;
}

export function PhotoField({ value, onChange }: PhotoFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    const resized = await resizeImage(file);
    onChange(resized);
    setProcessing(false);
    if (e.target) e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-0">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {value ? (
        <div className="overflow-hidden rounded-xl border border-border">
          <img src={value} alt="Photo" className="h-40 w-full object-cover" />
          <div className="flex gap-2 border-t border-border bg-secondary/40 px-3 py-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={processing}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5" />
              {processing ? "Processing…" : "Change Photo"}
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={processing}
              className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" />
              Remove Photo
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={processing}
          className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/30 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
        >
          <Camera className="h-6 w-6" />
          <span className="text-sm font-medium">
            {processing ? "Processing…" : "Add Photo"}
          </span>
        </button>
      )}
    </div>
  );
}
