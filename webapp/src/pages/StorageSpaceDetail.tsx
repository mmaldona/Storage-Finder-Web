import { ArrowLeft, Layers, QrCode } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StorageRow } from "@/components/StorageRow";
import { SwipeableRow } from "@/components/SwipeableRow";
import { QRCodeModal } from "@/components/QRCodeModal";
import { ViewToggle } from "@/components/ViewToggle";
import { CardGrid } from "@/components/CardGrid";
import { CardItem } from "@/components/CardItem";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";
import { useViewMode } from "@/hooks/useViewMode";

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

const StorageSpaceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { locations, getChildLocations, deleteLocation } = useStorageSpaces();
  const [viewMode, setViewMode] = useViewMode(`space_${id}`);

  const [showQR, setShowQR] = useState<boolean>(false);

  const space = locations.find((s) => s.id === id);
  const spaceShelvs = getChildLocations(id ?? null);

  if (!space) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="text-muted-foreground">Storage space not found.</p>
        <Button onClick={() => navigate("/")}>Go back home</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showQR ? (
        <QRCodeModal
          spaceName={space.name}
          spaceId={space.id}
          onClose={() => setShowQR(false)}
        />
      ) : null}

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="mr-1 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold text-foreground">
            {space.name}
          </h1>
          {space.area ? (
            <p className="truncate text-sm text-muted-foreground">{space.area}</p>
          ) : null}
        </div>
        <button
          onClick={() => setShowQR(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
          title="Show QR code"
        >
          <QrCode className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col" style={{ paddingBottom: "calc(100px + env(safe-area-inset-bottom))" }}>
        {spaceShelvs.length === 0 ? (
          <>
            <div className="px-4 pt-5 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shelves / Sections
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center px-6 py-16">
              <div className="flex max-w-sm flex-col items-center text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Layers className="h-8 w-8" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  No shelves yet
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first shelf.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Count row with toggle */}
            <div className="flex items-center justify-between px-4 pt-5 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Shelves / Sections
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {spaceShelvs.length} shelf{spaceShelvs.length !== 1 ? "ves" : ""}
                </span>
                <ViewToggle mode={viewMode} onChange={setViewMode} />
              </div>
            </div>
            {viewMode === "list" ? (
              spaceShelvs.map((shelf) => (
                <SwipeableRow
                  key={`${location.key}-${spaceShelvs.length}-${shelf.id}`}
                  deleteName={shelf.name}
                  onEdit={() => navigate(`/space/${id}/shelf/${shelf.id}/edit`)}
                  onDelete={() => deleteLocation(shelf.id)}
                >
                  <StorageRow
                    description={shelf.name}
                    subtitle={shelf.notes}
                    date={formatDate(shelf.createdAt)}
                    icon={<Layers className="h-6 w-6" />}
                    onClick={() => navigate(`/space/${id}/shelf/${shelf.id}`)}
                  />
                </SwipeableRow>
              ))
            ) : (
              <CardGrid>
                {spaceShelvs.map((shelf) => (
                  <CardItem
                    key={shelf.id}
                    name={shelf.name}
                    subtitle={shelf.notes}
                    date={formatDate(shelf.createdAt)}
                    icon={<Layers className="h-6 w-6" />}
                    onClick={() => navigate(`/space/${id}/shelf/${shelf.id}`)}
                  />
                ))}
              </CardGrid>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default StorageSpaceDetail;
