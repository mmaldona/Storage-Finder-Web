import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Archive, Package } from "lucide-react";
import { useStorageSpaces, type DeletedLocation, type Location } from "@/context/StorageSpacesContext";
import { SwipeableDeletedRow } from "@/components/SwipeableDeletedRow";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function daysLeft(deletedAt: string): number {
  const elapsed = Date.now() - new Date(deletedAt).getTime();
  return Math.max(0, Math.ceil((THIRTY_DAYS_MS - elapsed) / (24 * 60 * 60 * 1000)));
}

type EntryKind = "location" | "item";

interface DisplayEntry {
  kind: EntryKind;
  id: string;
  name: string;
  deletedAt: string;
  location: string;
}

const TYPE_LABEL: Record<EntryKind, string> = {
  location: "Location",
  item: "Item",
};

const TYPE_ICON: Record<EntryKind, JSX.Element> = {
  location: <Archive className="h-5 w-5" />,
  item: <Package className="h-5 w-5" />,
};

const RecentlyDeleted = () => {
  const navigate = useNavigate();
  const { locations, recentlyDeleted, restoreLocation, restoreItem, permanentlyDelete } =
    useStorageSpaces();

  // Merge active + deleted locations for path resolution
  const allLocations: Location[] = [
    ...locations,
    ...recentlyDeleted
      .filter((e): e is DeletedLocation => e._type === "location")
      .map((e): Location => ({
        id: e.id,
        name: e.name,
        area: e.area,
        notes: e.notes,
        parentId: e.parentId,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      })),
  ];

  function buildPath(locationId: string | null): string {
    const parts: string[] = [];
    let currentId: string | null = locationId;
    while (currentId !== null) {
      const found = allLocations.find((l) => l.id === currentId);
      if (!found) break;
      parts.unshift(found.name);
      currentId = found.parentId;
    }
    return parts.join(" > ");
  }

  const entries: DisplayEntry[] = recentlyDeleted
    .map((entry): DisplayEntry => {
      if (entry._type === "location") {
        const parentPath = entry.parentId ? buildPath(entry.parentId) : "";
        return {
          kind: "location",
          id: entry.id,
          name: entry.name,
          deletedAt: entry.deletedAt,
          location: parentPath ? `In ${parentPath}` : "",
        };
      } else {
        const locationPath = entry.locationId ? buildPath(entry.locationId) : "";
        return {
          kind: "item",
          id: entry.id,
          name: entry.name,
          deletedAt: entry.deletedAt,
          location: locationPath,
        };
      }
    })
    .sort((a, b) => new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime());

  const handleRestore = (entry: DisplayEntry) => {
    if (entry.kind === "location") restoreLocation(entry.id);
    else restoreItem(entry.id);
  };

  const handlePermanentDelete = (entry: DisplayEntry) => {
    permanentlyDelete(entry.id);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Recently Deleted</h1>
            <p className="text-sm text-muted-foreground">
              Items are permanently deleted after 30 days
            </p>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
          <div className="max-w-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
              <Trash2 className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-lg font-semibold text-foreground">
              Nothing in Recently Deleted
            </h2>
            <p className="text-sm text-muted-foreground">
              Deleted locations and items appear here for 30 days before being permanently removed.
            </p>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {entries.map((entry) => (
            <SwipeableDeletedRow
              key={`${entry.kind}-${entry.id}`}
              onRestore={() => handleRestore(entry)}
              onPermanentDelete={() => handlePermanentDelete(entry)}
              deleteName={entry.name}
            >
              <div className="flex items-center gap-4 px-4 py-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  {TYPE_ICON[entry.kind]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{entry.name}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                    <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {TYPE_LABEL[entry.kind]}
                    </span>
                    {entry.location !== "" ? entry.location : null}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-amber-600">
                    Permanently deletes in {daysLeft(entry.deletedAt)}{" "}
                    {daysLeft(entry.deletedAt) === 1 ? "day" : "days"}
                  </p>
                </div>
              </div>
            </SwipeableDeletedRow>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentlyDeleted;
