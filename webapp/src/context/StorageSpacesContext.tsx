import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Location {
  id: string;
  name: string;
  area?: string;
  notes?: string;
  photo?: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Item {
  id: string;
  name: string;
  notes?: string;
  photo?: string;
  locationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DeletedLocation = Location & { deletedAt: string; _type: "location" };
export type DeletedItem = Item & { deletedAt: string; _type: "item" };
export type RecentlyDeletedEntry = DeletedLocation | DeletedItem;

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const LOCATIONS_KEY = "storagefinder_locations_v1";
const ITEMS_KEY = "storagefinder_items_v3";
const DELETED_KEY = "storagefinder_deleted_v1";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

// ─── Context Interface ────────────────────────────────────────────────────────

interface StorageContextValue {
  locations: Location[];
  addLocation: (data: Omit<Location, "id" | "createdAt" | "updatedAt">) => Location;
  updateLocation: (id: string, changes: Partial<Omit<Location, "id" | "createdAt" | "updatedAt">>) => void;
  deleteLocation: (id: string) => void;
  getChildLocations: (parentId: string | null) => Location[];
  getRootLocations: () => Location[];
  getLocationPath: (id: string) => string;
  items: Item[];
  addItem: (data: Omit<Item, "id" | "createdAt" | "updatedAt">) => Item;
  updateItem: (id: string, changes: Partial<Omit<Item, "id" | "createdAt" | "updatedAt">>) => void;
  deleteItem: (id: string) => void;
  getItemsForLocation: (locationId: string | null) => Item[];
  recentlyDeleted: RecentlyDeletedEntry[];
  restoreLocation: (id: string) => void;
  restoreItem: (id: string) => void;
  permanentlyDelete: (id: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadFromStorage<T>(key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T[]) : [];
  } catch {
    return [];
  }
}

function pruneOldDeleted<T extends { deletedAt: string }>(items: T[]): T[] {
  const cutoff = Date.now() - THIRTY_DAYS_MS;
  return items.filter((item) => new Date(item.deletedAt).getTime() > cutoff);
}

function getDescendantIds(locationId: string, allLocations: Location[]): string[] {
  const children = allLocations.filter((l) => l.parentId === locationId);
  return children.flatMap((c) => [c.id, ...getDescendantIds(c.id, allLocations)]);
}

// Runs once at module load: migrate old 3-model data to unified location model
function runMigration(): void {
  if (localStorage.getItem(LOCATIONS_KEY) !== null) return;

  // Carry items over, orphaning them (their old shelfId/spaceId no longer maps to anything)
  const oldItems = loadFromStorage<Record<string, unknown>>("storagefinder_items_v2");
  const migratedItems: Item[] = oldItems.map((old) => ({
    id: old.id as string,
    name: old.name as string,
    notes: old.notes as string | undefined,
    photo: old.photoUrl as string | undefined,
    locationId: null,
    createdAt: old.createdAt as string,
    updatedAt: new Date().toISOString(),
  }));

  localStorage.setItem(LOCATIONS_KEY, JSON.stringify([]));
  localStorage.setItem(ITEMS_KEY, JSON.stringify(migratedItems));
  localStorage.setItem(DELETED_KEY, JSON.stringify([]));

  // Remove all legacy keys
  [
    "storagefinder_spaces_v2",
    "storagefinder_shelves_v2",
    "storagefinder_items_v2",
    "storagefinder_deleted_spaces",
    "storagefinder_deleted_shelves",
    "storagefinder_deleted_items",
  ].forEach((k) => localStorage.removeItem(k));
}

runMigration();

// ─── Provider ─────────────────────────────────────────────────────────────────

const StorageSpacesContext = createContext<StorageContextValue | null>(null);

export function StorageSpacesProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<Location[]>(() =>
    loadFromStorage<Location>(LOCATIONS_KEY)
  );

  const [items, setItems] = useState<Item[]>(() =>
    loadFromStorage<Item>(ITEMS_KEY)
  );

  const [recentlyDeleted, setRecentlyDeleted] = useState<RecentlyDeletedEntry[]>(() => {
    const pruned = pruneOldDeleted(loadFromStorage<RecentlyDeletedEntry>(DELETED_KEY));
    localStorage.setItem(DELETED_KEY, JSON.stringify(pruned));
    return pruned;
  });

  useEffect(() => {
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(DELETED_KEY, JSON.stringify(recentlyDeleted));
  }, [recentlyDeleted]);

  // ─── Location Methods ──────────────────────────────────────────────────────

  const addLocation = (data: Omit<Location, "id" | "createdAt" | "updatedAt">): Location => {
    const now = new Date().toISOString();
    const newLocation: Location = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    setLocations((prev) => [newLocation, ...prev]);
    return newLocation;
  };

  const updateLocation = (
    id: string,
    changes: Partial<Omit<Location, "id" | "createdAt" | "updatedAt">>
  ) => {
    setLocations((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...changes, updatedAt: new Date().toISOString() } : l))
    );
  };

  const deleteLocation = (id: string) => {
    const target = locations.find((l) => l.id === id);
    if (!target) return;
    const now = new Date().toISOString();

    const descendantIds = getDescendantIds(id, locations);
    const allAffectedIds = new Set([id, ...descendantIds]);

    const deletedLocs: DeletedLocation[] = locations
      .filter((l) => allAffectedIds.has(l.id))
      .map((l) => ({ ...l, deletedAt: now, _type: "location" as const }));

    const deletedItms: DeletedItem[] = items
      .filter((item) => item.locationId !== null && allAffectedIds.has(item.locationId))
      .map((item) => ({ ...item, deletedAt: now, _type: "item" as const }));

    setLocations((prev) => prev.filter((l) => !allAffectedIds.has(l.id)));
    setItems((prev) =>
      prev.filter((item) => item.locationId === null || !allAffectedIds.has(item.locationId))
    );
    setRecentlyDeleted((prev) => [...deletedLocs, ...deletedItms, ...prev]);
  };

  const getChildLocations = (parentId: string | null): Location[] =>
    locations.filter((l) => l.parentId === parentId);

  const getRootLocations = (): Location[] => locations.filter((l) => l.parentId === null);

  const getLocationPath = (id: string): string => {
    const parts: string[] = [];
    let currentId: string | null = id;
    while (currentId !== null) {
      const current = locations.find((l) => l.id === currentId);
      if (!current) break;
      parts.unshift(current.name);
      currentId = current.parentId;
    }
    return parts.join(" > ");
  };

  // ─── Item Methods ──────────────────────────────────────────────────────────

  const addItem = (data: Omit<Item, "id" | "createdAt" | "updatedAt">): Item => {
    const now = new Date().toISOString();
    const newItem: Item = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  const updateItem = (
    id: string,
    changes: Partial<Omit<Item, "id" | "createdAt" | "updatedAt">>
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...changes, updatedAt: new Date().toISOString() } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    const target = items.find((it) => it.id === id);
    if (!target) return;
    const deletedEntry: DeletedItem = { ...target, deletedAt: new Date().toISOString(), _type: "item" };
    setRecentlyDeleted((prev) => [deletedEntry, ...prev]);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const getItemsForLocation = (locationId: string | null): Item[] =>
    items.filter((item) => item.locationId === locationId);

  // ─── Restore / Permanently Delete ──────────────────────────────────────────

  const restoreLocation = (id: string) => {
    const entry = recentlyDeleted.find(
      (e): e is DeletedLocation => e._type === "location" && e.id === id
    );
    if (!entry) return;
    const location: Location = {
      id: entry.id,
      name: entry.name,
      area: entry.area,
      notes: entry.notes,
      photo: entry.photo,
      parentId: entry.parentId,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
    setLocations((prev) => [location, ...prev]);
    setRecentlyDeleted((prev) => prev.filter((e) => !(e._type === "location" && e.id === id)));
  };

  const restoreItem = (id: string) => {
    const entry = recentlyDeleted.find(
      (e): e is DeletedItem => e._type === "item" && e.id === id
    );
    if (!entry) return;
    const item: Item = {
      id: entry.id,
      name: entry.name,
      notes: entry.notes,
      photo: entry.photo,
      locationId: entry.locationId,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    };
    setItems((prev) => [item, ...prev]);
    setRecentlyDeleted((prev) => prev.filter((e) => !(e._type === "item" && e.id === id)));
  };

  const permanentlyDelete = (id: string) => {
    setRecentlyDeleted((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <StorageSpacesContext.Provider
      value={{
        locations,
        addLocation,
        updateLocation,
        deleteLocation,
        getChildLocations,
        getRootLocations,
        getLocationPath,
        items,
        addItem,
        updateItem,
        deleteItem,
        getItemsForLocation,
        recentlyDeleted,
        restoreLocation,
        restoreItem,
        permanentlyDelete,
      }}
    >
      {children}
    </StorageSpacesContext.Provider>
  );
}

export function useStorageSpaces() {
  const ctx = useContext(StorageSpacesContext);
  if (!ctx) throw new Error("useStorageSpaces must be used within StorageSpacesProvider");
  return ctx;
}
