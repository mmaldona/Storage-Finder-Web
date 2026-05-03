import { ArrowLeft, Package } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StorageRow } from "@/components/StorageRow";
import { SwipeableRow } from "@/components/SwipeableRow";
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

const ShelfDetail = () => {
  const { id: spaceId, shelfId } = useParams<{ id: string; shelfId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { locations, items, deleteItem } = useStorageSpaces();
  const [viewMode, setViewMode] = useViewMode(`shelf_${shelfId}`);

  const shelf = locations.find((s) => s.id === shelfId);
  const space = locations.find((s) => s.id === spaceId);
  const shelfItems = items.filter((item) => item.locationId === shelfId);

  if (!shelf) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="text-muted-foreground">Shelf not found.</p>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
            {shelf.name}
          </h1>
          {space ? (
            <p className="truncate text-sm text-muted-foreground">{space.name}</p>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col" style={{ paddingBottom: "calc(100px + env(safe-area-inset-bottom))" }}>
        {shelfItems.length === 0 ? (
          <>
            <div className="px-4 pt-5 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Items
              </p>
            </div>
            <div className="flex flex-1 items-center justify-center px-6 py-16">
              <div className="flex max-w-sm flex-col items-center text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Package className="h-8 w-8" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  No items yet
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first item.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Count row with toggle */}
            <div className="flex items-center justify-between px-4 pt-5 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Items
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {shelfItems.length} item{shelfItems.length !== 1 ? "s" : ""}
                </span>
                <ViewToggle mode={viewMode} onChange={setViewMode} />
              </div>
            </div>
            {viewMode === "list" ? (
              shelfItems.map((item) => (
                <SwipeableRow
                  key={`${location.key}-${shelfItems.length}-${item.id}`}
                  deleteName={item.name}
                  onEdit={() =>
                    navigate(`/space/${spaceId}/shelf/${shelfId}/item/${item.id}/edit`)
                  }
                  onDelete={() => deleteItem(item.id)}
                >
                  <StorageRow
                    description={item.name}
                    subtitle={item.notes}
                    date={formatDate(item.createdAt)}
                    photoUrl={item.photo}
                    icon={<Package className="h-6 w-6" />}
                    onClick={() =>
                      navigate(`/space/${spaceId}/shelf/${shelfId}/item/${item.id}/edit`)
                    }
                  />
                </SwipeableRow>
              ))
            ) : (
              <CardGrid>
                {shelfItems.map((item) => (
                  <CardItem
                    key={item.id}
                    name={item.name}
                    subtitle={item.notes}
                    date={formatDate(item.createdAt)}
                    photoUrl={item.photo}
                    icon={<Package className="h-6 w-6" />}
                    onClick={() =>
                      navigate(`/space/${spaceId}/shelf/${shelfId}/item/${item.id}/edit`)
                    }
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

export default ShelfDetail;
