import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationForm from "@/components/LocationForm";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";

type Phase = "location-form" | "location-modal" | "place-form" | "place-modal";

interface Parent {
  id: string;
  name: string;
}

const BTN =
  "flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium transition-colors hover:bg-gray-50 active:bg-gray-50";

const NewStorageSpace = () => {
  const navigate = useNavigate();
  const { addLocation } = useStorageSpaces();
  const [phase, setPhase] = useState<Phase>("location-form");
  const [currentParent, setCurrentParent] = useState<Parent | null>(null);
  const [formKey, setFormKey] = useState(0);
  // which modal to return to when user cancels the place form
  const [placeFormReturn, setPlaceFormReturn] = useState<
    "location-modal" | "place-modal"
  >("location-modal");
  const [lastPlaceParentId, setLastPlaceParentId] = useState<string | null>(null);

  // ─── Location modal ────────────────────────────────────────────────────────
  if (phase === "location-modal" && currentParent) {
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
        <div className="absolute inset-0 bg-black/50" onClick={() => navigate("/")} />
        <div
          className="relative z-10 w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={BTN}
            style={{ color: "#1a1a1a" }}
            onClick={() => {
              setPlaceFormReturn("location-modal");
              setFormKey((k) => k + 1);
              setPhase("place-form");
            }}
          >
            Create a Place in {currentParent.name}
          </button>
          <button
            className={BTN}
            style={{ color: "#1a1a1a" }}
            onClick={() => {
              setFormKey((k) => k + 1);
              setPhase("location-form");
            }}
          >
            Create another Location
          </button>
          <div className="my-2 h-px bg-gray-200" />
          <button
            className={BTN}
            style={{ color: "#6b7280" }}
            onClick={() => navigate("/")}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

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
        <div className="absolute inset-0 bg-black/50" onClick={() => navigate(lastPlaceParentId ? `/location/${lastPlaceParentId}` : "/")} />
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
              setPlaceFormReturn("place-modal");
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
            onClick={() => navigate(lastPlaceParentId ? `/location/${lastPlaceParentId}` : "/")}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ─── Place form (inline, no navigation) ───────────────────────────────────
  // currentParent here is the parent to create the Place inside
  if (phase === "place-form" && currentParent) {
    return (
      <LocationForm
        key={formKey}
        parentId={currentParent.id}
        isEditing={false}
        onSave={({ name, area, notes, photo }) => {
          const parentId = currentParent.id;
          const newPlace = addLocation({
            parentId,
            name,
            area: area || undefined,
            notes: notes || undefined,
            photo: photo || undefined,
          });
          setLastPlaceParentId(parentId);
          setCurrentParent({ id: newPlace.id, name: newPlace.name });
          setPhase("place-modal");
        }}
        onCancel={() => setPhase(placeFormReturn)}
      />
    );
  }

  // ─── Location form ─────────────────────────────────────────────────────────
  return (
    <LocationForm
      key={formKey}
      parentId={null}
      isEditing={false}
      onSave={({ name, area, notes, photo }) => {
        const newLoc = addLocation({
          parentId: null,
          name,
          area: area || undefined,
          notes: notes || undefined,
          photo: photo || undefined,
        });
        setCurrentParent({ id: newLoc.id, name: newLoc.name });
        setPhase("location-modal");
      }}
      onCancel={() => navigate(-1)}
    />
  );
};

export default NewStorageSpace;
