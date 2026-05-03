import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LocationForm from "@/components/LocationForm";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";

const EditStorageSpace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { locations, updateLocation } = useStorageSpaces();

  const space = locations.find((s) => s.id === id);

  if (!space) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="text-muted-foreground">Location not found.</p>
        <Button onClick={() => navigate("/")}>Go home</Button>
      </div>
    );
  }

  return (
    <LocationForm
      parentId={space.parentId ?? null}
      isEditing={true}
      initialName={space.name}
      initialArea={space.area ?? ""}
      initialNotes={space.notes ?? ""}
      initialPhoto={space.photo}
      onSave={({ name, area, notes, photo }) => {
        updateLocation(id ?? "", {
          name,
          area: area || undefined,
          notes: notes || undefined,
          photo: photo || undefined,
        });
        navigate(space.parentId ? `/location/${space.parentId}` : "/");
      }}
      onCancel={() => navigate(-1)}
    />
  );
};

export default EditStorageSpace;
