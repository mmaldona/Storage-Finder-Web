import { useState } from "react";
import { ArrowLeft, MapPin, Package, QrCode } from "lucide-react";
import { useNavigate, useParams, useLocation as useRouterLocation } from "react-router-dom";
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
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const LocationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const {
    locations,
    getChildLocations,
    getItemsForLocation,
    getLocationPath,
    deleteLocation,
    deleteItem,
  } = useStorageSpaces();

  const [showQR, setShowQR] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [viewMode, setViewMode] = useViewMode(`location_${id}`);

  const loc = locations.find((l) => l.id === id);

  if (!loc) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="text-muted-foreground">Location not found.</p>
        <Button onClick={() => navigate("/")}>Go home</Button>
      </div>
    );
  }

  const childLocations = getChildLocations(id ?? null);
  const locationItems = getItemsForLocation(id ?? null);
  const locationPath = getLocationPath(id ?? "");
  const pathSegments = locationPath.split(" > ");
  const showBreadcrumb = pathSegments.length > 1;

  const spaceId = loc.parentId ?? loc.id;
  const shelfId = loc.id;

  const handleBack = () => {
    if (loc.parentId) {
      navigate(`/location/${loc.parentId}`);
    } else {
      navigate("/");
    }
  };

  return (
    <>
      {showQR ? (
        <QRCodeModal
          spaceName={loc.name}
          spaceId={loc.id}
          onClose={() => setShowQR(false)}
        />
      ) : null}

      {showAddModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowAddModal(false)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative z-10 w-[calc(100%-2rem)] max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium transition-colors hover:bg-gray-50 active:bg-gray-50"
              style={{ color: "#1a1a1a" }}
              onClick={() => {
                setShowAddModal(false);
                navigate(`/location/${loc.id}/new-location`);
              }}
            >
              Create a Place in {loc.name}
            </button>
            <button
              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium transition-colors hover:bg-gray-50 active:bg-gray-50"
              style={{ color: "#1a1a1a" }}
              onClick={() => {
                setShowAddModal(false);
                navigate(`/space/${spaceId}/shelf/${shelfId}/add-item-choice`);
              }}
            >
              Create an Item in {loc.name}
            </button>
            <div className="my-2 h-px bg-gray-200" />
            <button
              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-base font-medium text-gray-500 transition-colors hover:bg-gray-50 active:bg-gray-50"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex h-dvh flex-col bg-background overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background">
          <div className="flex items-center gap-3 px-4 py-4">
            <button
              onClick={handleBack}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold text-foreground">{loc.name}</h1>
              {loc.area ? (
                <p className="truncate text-sm text-muted-foreground">{loc.area}</p>
              ) : null}
            </div>
            <button
              onClick={() => setShowQR(true)}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              title="Show QR code"
            >
              <QrCode className="h-5 w-5" />
            </button>
          </div>
          {/* Breadcrumb row — always rendered to hold the toggle */}
          <div className="flex items-center justify-between gap-2 px-4 pb-3">
            {showBreadcrumb ? (
              <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap">
                {pathSegments.map((segment, index) => (
                  <span key={index} className="flex items-center gap-1">
                    {index > 0 ? (
                      <span className="text-xs text-muted-foreground/40">›</span>
                    ) : null}
                    <span
                      className={
                        index === pathSegments.length - 1
                          ? "text-xs font-medium text-foreground"
                          : "text-xs text-muted-foreground"
                      }
                    >
                      {segment}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex-1" />
            )}
            <ViewToggle mode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="flex flex-1 flex-col overflow-y-auto"
          style={{ paddingBottom: "calc(100px + env(safe-area-inset-bottom))" }}
        >
          {/* Section 1: Places Inside — hidden entirely when empty */}
          {childLocations.length > 0 ? (
            <div>
              <div className="flex items-center justify-between px-4 pt-5 pb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Places Inside
                </p>
                <span className="text-xs text-muted-foreground">{childLocations.length}</span>
              </div>
              {viewMode === "list" ? (
                childLocations.map((child) => (
                  <SwipeableRow
                    key={`${routerLocation.key}-sub-${childLocations.length}-${child.id}`}
                    deleteName={child.name}
                    onEdit={() => navigate(`/location/${child.id}/edit`)}
                    onDelete={() => deleteLocation(child.id)}
                  >
                    <StorageRow
                      description={child.name}
                      subtitle={child.area ?? child.notes}
                      date={formatDate(child.createdAt)}
                      photoUrl={child.photo}
                      icon={<MapPin className="h-6 w-6" />}
                      onClick={() => navigate(`/location/${child.id}`)}
                    />
                  </SwipeableRow>
                ))
              ) : (
                <CardGrid>
                  {childLocations.map((child) => (
                    <CardItem
                      key={child.id}
                      name={child.name}
                      subtitle={child.area ?? child.notes}
                      date={formatDate(child.createdAt)}
                      photoUrl={child.photo}
                      icon={<MapPin className="h-6 w-6" />}
                      onClick={() => navigate(`/location/${child.id}`)}
                    />
                  ))}
                </CardGrid>
              )}
            </div>
          ) : null}

          {/* Section 2: Items — always shown */}
          <div>
            <div className="flex items-center justify-between px-4 pt-5 pb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Items
              </p>
              <span className="text-xs text-muted-foreground">{locationItems.length}</span>
            </div>
            {locationItems.length === 0 ? (
              <div className="flex items-center justify-center px-6 py-8">
                <p className="text-sm text-muted-foreground">No items here yet.</p>
              </div>
            ) : viewMode === "list" ? (
              locationItems.map((item) => (
                <SwipeableRow
                  key={`${routerLocation.key}-item-${locationItems.length}-${item.id}`}
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
                {locationItems.map((item) => (
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
          </div>
        </div>

      </div>
    </>
  );
};

export default LocationDetail;
