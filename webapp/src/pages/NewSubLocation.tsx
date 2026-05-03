import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LocationForm from "@/components/LocationForm";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";

type Phase = "place-form" | "place-modal";

interface Parent {
  id: string;
  name: string;
}

const BTN =
  "flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium transition-colors hover:bg-gray-50 active:bg-gray-50";

const NewSubLocation = () => {
  const { parentId: urlParentId } = useParams<{ parentId: string }>();
  const navigate = useNavigate();
  const { addLocation } = useStorageSpaces();

  const [phase, setPhase] = useState<Phase>("place-form");
  // The id of the parent to create the next Place inside.
  // Starts as the URL param; updates to currentParent.id after each save.
  const [activePlaceParentId, setActivePlaceParentId] = useState<string>(
    urlParentId ?? "",
  );
  // The most recently saved Place.
  const [currentParent, setCurrentParent] = useState<Parent | null>(null);
  const [formKey, setFormKey] = useState(0);

  // ─── Place modal ───────────────────────────────────────────────────────────
  if (phase === "place-modal" && currentParent) {
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
        <div className="absolute inset-0 bg-black/50" onClick={() => navigate(`/location/${activePlaceParentId}`)} />
        <div
          className="relative z-10 w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={BTN}
            style={{ color: "#1a1a1a" }}
            onClick={() =>
              navigate(
                `/space/${currentParent.id}/shelf/${currentParent.id}/add-item-choice`,
              )
            }
          >
            Create an Item in {currentParent.name}
          </button>
          <button
            className={BTN}
            style={{ color: "#1a1a1a" }}
            onClick={() => {
              // next Place goes inside currentParent
              setActivePlaceParentId(currentParent.id);
              setFormKey((k) => k + 1);
              setPhase("place-form");
            }}
          >
            Create another Place in {currentParent.name}
          </button>
          <div className="my-2 h-px bg-gray-200" />
          <button
            className={BTN}
            style={{ color: "#6b7280" }}
            onClick={() => navigate(`/location/${activePlaceParentId}`)}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ─── Place form ────────────────────────────────────────────────────────────
  return (
    <LocationForm
      key={formKey}
      parentId={activePlaceParentId}
      isEditing={false}
      onSave={({ name, area, notes, photo }) => {
        const newPlace = addLocation({
          parentId: activePlaceParentId,
          name,
          area: area || undefined,
          notes: notes || undefined,
          photo: photo || undefined,
        });
        setCurrentParent({ id: newPlace.id, name: newPlace.name });
        setPhase("place-modal");
      }}
      onCancel={() => {
        if (currentParent === null) {
          // first form — go back to the detail screen
          navigate(-1);
        } else {
          // subsequent form — go back to the place modal
          setPhase("place-modal");
        }
      }}
    />
  );
};

export default NewSubLocation;
