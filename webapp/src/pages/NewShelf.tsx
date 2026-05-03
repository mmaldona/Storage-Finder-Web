import { useNavigate, useParams } from "react-router-dom";
import LocationForm from "@/components/LocationForm";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";

const NewShelf = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addLocation } = useStorageSpaces();

  return (
    <LocationForm
      parentId={id ?? null}
      isEditing={false}
      onSave={({ name, area, notes }) => {
        addLocation({
          parentId: id ?? null,
          name,
          area: area || undefined,
          notes: notes || undefined,
        });
        navigate(`/space/${id}`);
      }}
      onCancel={() => navigate(-1)}
    />
  );
};

export default NewShelf;
