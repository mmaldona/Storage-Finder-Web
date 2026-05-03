import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Camera, PencilLine } from "lucide-react";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";

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

const AddItemChoice = () => {
  const { id: spaceId, shelfId } = useParams<{ id: string; shelfId: string }>();
  const navigate = useNavigate();
  const { locations } = useStorageSpaces();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  const shelf = locations.find((s) => s.id === shelfId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProcessing(true);
    const photoUrl = await resizeImage(file);
    navigate(`/space/${spaceId}/shelf/${shelfId}/new-item`, {
      state: { photoUrl, parentName: shelf?.name },
    });
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
        <div>
          <h1 className="text-xl font-semibold text-foreground">Add New Item</h1>
          {shelf ? (
            <p className="text-sm text-muted-foreground">{shelf.name}</p>
          ) : null}
        </div>
      </div>

      {/* Hidden camera input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Choice area */}
      <div className="flex flex-1 flex-col justify-center gap-4 px-6 pb-8">
        <p className="mb-2 text-center text-sm text-muted-foreground">
          How would you like to add this item?
        </p>

        {/* Take Photo – primary */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={processing}
          className="flex w-full flex-col items-center gap-2 rounded-2xl bg-primary px-6 py-7 text-primary-foreground shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <Camera className="h-7 w-7" />
          </div>
          <span className="text-lg font-semibold">
            {processing ? "Processing…" : "📷 Take Photo"}
          </span>
          <span className="text-sm opacity-75">Recommended – AI will help name it</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Skip Photo – secondary */}
        <button
          onClick={() =>
            navigate(`/space/${spaceId}/shelf/${shelfId}/new-item`, {
              state: { parentName: shelf?.name },
            })
          }
          className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-border bg-background px-6 py-7 text-foreground transition-all hover:bg-secondary active:scale-[0.98]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <PencilLine className="h-7 w-7 text-muted-foreground" />
          </div>
          <span className="text-lg font-semibold">Skip Photo</span>
          <span className="text-sm text-muted-foreground">Enter details manually</span>
        </button>

        {/* Cancel */}
        <button
          onClick={() => navigate(`/location/${shelfId}`)}
          className="flex w-full items-center justify-center rounded-xl border-2 border-border bg-background px-6 py-3 text-base font-medium text-muted-foreground transition-all hover:bg-secondary active:scale-[0.98]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddItemChoice;
