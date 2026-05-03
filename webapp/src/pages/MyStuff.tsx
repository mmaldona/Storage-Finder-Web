import { useEffect } from "react";
import { MapPin, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { SwipeableRow } from "@/components/SwipeableRow";
import { ViewToggle } from "@/components/ViewToggle";
import { CardGrid } from "@/components/CardGrid";
import { CardItem } from "@/components/CardItem";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";
import { useViewMode } from "@/hooks/useViewMode";
import type { Location } from "@/context/StorageSpacesContext";

const formatDate = (iso: string) => {
  const date = new Date(iso);
  const today = new Date();
  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return "Added today";
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface LocationRowContentProps {
  loc: Location;
  onClick: () => void;
}

function LocationRowContent({ loc, onClick }: LocationRowContentProps) {
  return (
    <button
      className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors active:bg-secondary/50"
      onClick={onClick}
    >
      {loc.photo ? (
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
          <img src={loc.photo} alt="" className="h-full w-full object-cover" loading="lazy" />
        </div>
      ) : (
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1E6FD9]">
          <MapPin className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-bold text-foreground">{loc.name}</p>
        {loc.area ? (
          <p className="truncate text-sm text-muted-foreground">{loc.area}</p>
        ) : null}
        <p className="text-sm text-muted-foreground">{formatDate(loc.createdAt)}</p>
      </div>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
    </button>
  );
}

const MyStuff = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { getRootLocations, deleteLocation } = useStorageSpaces();
  const rootLocations = getRootLocations();
  const [viewMode, setViewMode] = useViewMode("root");

  useEffect(() => {
    if (rootLocations.length === 0) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [rootLocations.length]);

  if (rootLocations.length === 0) {
    return (
      <div className="fixed inset-x-0 top-0 bottom-0 z-10 flex flex-col overflow-hidden bg-background">
        <div className="border-b border-border px-4 pb-3 pt-5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Locations</h1>
        </div>
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="flex max-w-sm flex-col items-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#1E6FD9]">
              <MapPin className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">No locations yet.</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create your first one.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-4 pb-3 pt-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Locations</h1>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {rootLocations.length} location{rootLocations.length !== 1 ? "s" : ""}
          </p>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="divide-y divide-border">
          {rootLocations.map((loc) => (
            <SwipeableRow
              key={`${routerLocation.key}-${rootLocations.length}-${loc.id}`}
              deleteName={loc.name}
              onEdit={() => navigate(`/location/${loc.id}/edit`)}
              onDelete={() => deleteLocation(loc.id)}
            >
              <LocationRowContent
                loc={loc}
                onClick={() => navigate(`/location/${loc.id}`)}
              />
            </SwipeableRow>
          ))}
        </div>
      ) : (
        <CardGrid>
          {rootLocations.map((loc) => (
            <CardItem
              key={loc.id}
              name={loc.name}
              subtitle={loc.area}
              date={formatDate(loc.createdAt)}
              photoUrl={loc.photo}
              icon={<MapPin className="h-6 w-6" />}
              onClick={() => navigate(`/location/${loc.id}`)}
            />
          ))}
        </CardGrid>
      )}
    </div>
  );
};

export default MyStuff;
