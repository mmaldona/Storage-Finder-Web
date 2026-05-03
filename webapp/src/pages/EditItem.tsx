import { useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";
import { api } from "@/lib/api";

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

const EditItem = () => {
  const { id: spaceId, shelfId, itemId } = useParams<{
    id: string;
    shelfId: string;
    itemId: string;
  }>();
  const navigate = useNavigate();
  const { items, updateItem } = useStorageSpaces();

  const item = items.find((i) => i.id === itemId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(item?.photo ?? null);
  const [name, setName] = useState(item?.name ?? "");
  const [notes, setNotes] = useState(item?.notes ?? "");
  const [nameError, setNameError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const analyzePhoto = useCallback(async (url: string) => {
    setAiAnalyzing(true);
    try {
      const result = await api.post<{ name: string }>("/api/analyze-image", {
        imageDataUrl: url,
      });
      if (result?.name) {
        setName(result.name);
        setNameError("");
      }
    } catch {
      // silently fail — user can type manually
    } finally {
      setAiAnalyzing(false);
    }
  }, []);

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="text-muted-foreground">Item not found.</p>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    const resized = await resizeImage(file);
    setPhotoUrl(resized);
    setProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    analyzePhoto(resized);
  };

  const handleSave = () => {
    if (!name.trim()) {
      setNameError("Item name is required");
      return;
    }
    updateItem(itemId ?? "", {
      name: name.trim(),
      notes: notes.trim() || undefined,
      photo: photoUrl ?? undefined,
    });
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center border-b border-border px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">Edit Item</h1>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Form */}
      <div className="flex flex-1 flex-col gap-6 px-6 py-6">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="name" className="text-sm font-medium">
              Item Name <span className="text-destructive">*</span>
            </Label>
            {photoUrl && !aiAnalyzing ? (
              <button
                onClick={() => analyzePhoto(photoUrl)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#1E6FD9] transition-colors hover:bg-blue-50 hover:text-[#1559B0]"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </button>
            ) : null}
          </div>
          <Input
            id="name"
            placeholder={aiAnalyzing ? "" : "e.g. Board Game, Winter Jacket"}
            value={name}
            autoFocus
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
            disabled={aiAnalyzing}
            className={`${nameError ? "border-destructive focus-visible:ring-destructive" : ""} ${aiAnalyzing ? "opacity-60" : ""}`}
          />
          {aiAnalyzing ? (
            <p className="flex items-center gap-1.5 text-xs text-[#1E6FD9]">
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#1E6FD9] border-t-transparent" />
              Analyzing with AI…
            </p>
          ) : nameError ? (
            <p className="text-xs text-destructive">{nameError}</p>
          ) : null}
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notes{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            placeholder="e.g. from grandma 1998, missing one piece"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[90px] resize-none"
          />
        </div>

        {/* Photo section */}
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">
            Photo{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>

          {photoUrl ? (
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="relative">
                <img
                  src={photoUrl}
                  alt="Item photo"
                  className="h-48 w-full object-cover"
                />
              </div>
              <div className="flex gap-2 border-t border-border bg-secondary/40 px-3 py-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processing || aiAnalyzing}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  <Camera className="h-3.5 w-3.5" />
                  {processing ? "Processing…" : "Change Photo"}
                </button>
                <button
                  onClick={() => setPhotoUrl(null)}
                  disabled={aiAnalyzing}
                  className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                className="flex h-24 w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-secondary/30 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary disabled:opacity-50"
              >
                <Camera className="h-6 w-6" />
                <span className="text-sm font-medium">
                  {processing ? "Processing…" : "Add Photo"}
                </span>
              </button>
              <p className="text-xs text-muted-foreground">
                Adding a photo will let AI suggest a name.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Save button */}
      <div
        className="flex gap-3 border-t border-border px-6 py-4"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <Button
          variant="outline"
          className="h-12 flex-1 text-base"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
        <Button
          className="h-12 flex-1 bg-primary text-base text-primary-foreground hover:bg-primary/90"
          onClick={handleSave}
          disabled={aiAnalyzing}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditItem;
