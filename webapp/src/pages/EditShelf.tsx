import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LocationForm from "@/components/LocationForm";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";

const EditShelf = () => {
  const { id: spaceId, shelfId } = useParams<{ id: string; shelfId: string }>();
  const navigate = useNavigate();
  const { locations, updateLocation } = useStorageSpaces();

  const shelf = locations.find((s) => s.id === shelfId);

  if (!shelf) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="text-muted-foreground">Location not found.</p>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  return (
    <LocationForm
      parentId={shelf.parentId ?? null}
      isEditing={true}
      initialName={shelf.name}
      initialArea={shelf.area ?? ""}
      initialNotes={shelf.notes ?? ""}
      initialPhoto={shelf.photo}
      onSave={({ name, area, notes, photo }) => {
        updateLocation(shelfId ?? "", {
          name,
          area: area || undefined,
          notes: notes || undefined,
          photo: photo || undefined,
        });
        navigate(`/space/${spaceId}/shelf/${shelfId}`);
      }}
      onCancel={() => navigate(-1)}
    />
  );
};

export default EditShelf;
