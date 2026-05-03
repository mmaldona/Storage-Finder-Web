import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoField } from "@/components/PhotoField";

interface LocationFormProps {
  parentId: string | null;
  isEditing: boolean;
  initialName?: string;
  initialArea?: string;
  initialNotes?: string;
  initialPhoto?: string;
  onSave: (data: { name: string; area: string; notes: string; photo?: string }) => void;
  onCancel: () => void;
}

const LocationForm = ({
  parentId,
  isEditing,
  initialName = "",
  initialArea = "",
  initialNotes = "",
  initialPhoto,
  onSave,
  onCancel,
}: LocationFormProps) => {
  const [name, setName] = useState(initialName);
  const [area, setArea] = useState(initialArea);
  const [notes, setNotes] = useState(initialNotes);
  const [nameError, setNameError] = useState("");
  const [photo, setPhoto] = useState<string | null>(initialPhoto ?? null);

  const handleSave = () => {
    if (!name.trim()) {
      setNameError("Name is required");
      return;
    }
    onSave({ name: name.trim(), area: area.trim(), notes: notes.trim(), photo: photo ?? undefined });
  };

  return (
    <div className="flex h-dvh flex-col bg-background overflow-hidden">
      <div className="flex items-center border-b border-border px-4 py-4">
        <button
          onClick={onCancel}
          className="mr-3 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-semibold text-foreground">
          {isEditing
            ? parentId ? "Edit Place" : "Edit Location"
            : parentId ? "New Place" : "New Location"}
        </h1>
      </div>

      <div
        className="flex flex-1 flex-col gap-7 overflow-auto px-6 py-8"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Game Closet, Garage, Kitchen Pantry"
            value={name}
            autoFocus={!!initialName}
            onChange={(e) => {
              setName(e.target.value);
              setNameError("");
            }}
            className={nameError ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {nameError ? (
            <p className="text-xs text-destructive">{nameError}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="area" className="text-sm font-medium">
            Area{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="area"
            placeholder="e.g. Kitchen, Basement"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="notes" className="text-sm font-medium">
            Notes{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            placeholder="Any notes about this location…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium">
            Photo{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <PhotoField value={photo} onChange={setPhoto} />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            className="h-14 w-full rounded-xl bg-[#1E6FD9] text-base font-semibold text-white hover:bg-[#1559B0]"
            onClick={handleSave}
          >
            Save
          </Button>
          <Button
            variant="outline"
            className="h-12 w-full rounded-xl text-base"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationForm;
