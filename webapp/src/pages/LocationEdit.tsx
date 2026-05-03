import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LocationForm from "@/components/LocationForm";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";

const LocationEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { locations, updateLocation } = useStorageSpaces();

  const loc = locations.find((l) => l.id === id);

  if (!loc) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="text-muted-foreground">Location not found.</p>
        <Button onClick={() => navigate("/")}>Go home</Button>
      </div>
    );
  }

  return (
    <LocationForm
      parentId={loc.parentId}
      isEditing={true}
      initialName={loc.name}
      initialArea={loc.area ?? ""}
      initialNotes={loc.notes ?? ""}
      initialPhoto={loc.photo}
      onSave={({ name, area, notes, photo }) => {
        updateLocation(id ?? "", {
          name,
          area: area || undefined,
          notes: notes || undefined,
          photo: photo || undefined,
        });
        navigate(loc.parentId ? `/location/${loc.parentId}` : "/");
      }}
      onCancel={() => navigate(-1)}
    />
  );
};

export default LocationEdit;
