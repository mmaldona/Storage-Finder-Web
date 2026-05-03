import { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
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

const NewItem = () => {
  const { id: spaceId, shelfId } = useParams<{ id: string; shelfId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem } = useStorageSpaces();

  const routeState = location.state as {
    photoUrl?: string;
    parentName?: string;
  } | null;
  const initialPhoto = routeState?.photoUrl ?? null;
  const parentName = routeState?.parentName ?? "this Place";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhoto);
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);

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

  useEffect(() => {
    if (initialPhoto) {
      analyzePhoto(initialPhoto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    addItem({
      locationId: shelfId ?? null,
      name: name.trim(),
      notes: notes.trim() || undefined,
      photo: photoUrl ?? undefined,
    });
    setSaved(true);
  };

  if (saved) {
    const BTN =
      "flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium transition-colors hover:bg-gray-50 active:bg-gray-50";
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => navigate(`/location/${shelfId}`)} />
        <div
          className="relative z-10 w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={BTN}
            style={{ color: "#1a1a1a" }}
            onClick={() => {
              navigate(`/space/${spaceId}/shelf/${shelfId}/add-item-choice`, {
                state: { parentName },
              });
            }}
          >
            Add another Item in {parentName}
          </button>
          <div className="my-2 h-px bg-gray-200" />
          <button
            className={BTN}
            style={{ color: "#6b7280" }}
            onClick={() => navigate(`/location/${shelfId}`)}
          >
            Finish
          </button>
        </div>
      </div>
    );
  }

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
        <h1 className="text-xl font-semibold text-foreground">New Item</h1>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-1 flex-col overflow-auto">
        {photoUrl ? (
          <div className="relative">
            <img
              src={photoUrl}
              alt="Item photo"
              className="h-56 w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 flex gap-1 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-white/20 disabled:opacity-50"
              >
                <Camera className="h-3.5 w-3.5" />
                {processing ? "Processing…" : "Change Photo"}
              </button>
              <button
                onClick={() => setPhotoUrl(null)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" />
                Remove Photo
              </button>
            </div>
          </div>
        ) : null}

        <div
          className="flex flex-col gap-5 px-6 py-6"
          style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
        >
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
              autoFocus={!initialPhoto}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              disabled={aiAnalyzing}
              className={`h-12 text-base ${nameError ? "border-destructive focus-visible:ring-destructive" : ""} ${aiAnalyzing ? "opacity-60" : ""}`}
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
              className="min-h-[100px] resize-none text-base"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              className="h-14 w-full rounded-xl bg-[#1E6FD9] text-base font-semibold text-white hover:bg-[#1559B0]"
              onClick={handleSave}
              disabled={aiAnalyzing}
            >
              Save Item
            </Button>
            <Button
              variant="outline"
              className="h-12 w-full rounded-xl text-base"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewItem;
