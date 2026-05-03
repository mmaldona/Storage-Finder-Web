import { Boxes, Package, Search } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { StorageRow } from "@/components/StorageRow";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";
import type { Location, Item } from "@/context/StorageSpacesContext";

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

function matches(value: string | undefined | null, query: string): boolean {
  if (!value) return false;
  return value.toLowerCase().includes(query);
}

function locationMatches(loc: Location, q: string): boolean {
  return matches(loc.name, q) || matches(loc.area, q) || matches(loc.notes, q);
}

function itemMatches(item: Item, q: string): boolean {
  return matches(item.name, q) || matches(item.notes, q);
}

function pluralItems(count: number): string {
  return count === 1 ? "1 item" : `${count} items`;
}

interface SectionHeaderProps {
  title: string;
  count: number;
}

function SectionHeader({ title, count }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </div>
  );
}

const SearchPage = () => {
  const [query, setQuery] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { locations, items, getLocationPath, getItemsForLocation } = useStorageSpaces();

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [location.key]);

  const q = query.trim().toLowerCase();

  const matchedLocations = q ? locations.filter((l) => locationMatches(l, q)) : [];
  const matchedItems = q ? items.filter((it) => itemMatches(it, q)) : [];

  const totalResults = matchedLocations.length + matchedItems.length;
  const hasResults = totalResults > 0;

  const getLocationSubtitle = (loc: Location): string => {
    const itemCount = getItemsForLocation(loc.id).length;
    const childCount = locations.filter((l) => l.parentId === loc.id).length;
    const parts: string[] = [];
    if (loc.area) parts.push(loc.area);
    if (childCount > 0) parts.push(`${childCount} sub-location${childCount !== 1 ? "s" : ""}`);
    parts.push(pluralItems(itemCount));
    return parts.join(" · ");
  };

  const getItemSubtitle = (item: Item): string => {
    if (!item.locationId) return "";
    return getLocationPath(item.locationId);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Search input */}
      <div className="sticky top-0 z-10 border-b border-border bg-background px-4 py-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            placeholder="Search everything..."
            className="h-11 w-full rounded-xl border border-border bg-secondary pl-10 pr-4 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {q === "" ? (
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
          <div className="max-w-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Search className="h-8 w-8" />
            </div>
            <p className="text-sm text-muted-foreground">
              Start typing to search everything
            </p>
          </div>
        </div>
      ) : !hasResults ? (
        <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
          <div className="max-w-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Search className="h-8 w-8" />
            </div>
            <p className="text-sm text-muted-foreground">
              No results for &ldquo;{query.trim()}&rdquo;
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          {matchedLocations.length > 0 ? (
            <div>
              <SectionHeader title="Locations" count={matchedLocations.length} />
              {matchedLocations.map((loc) => (
                <StorageRow
                  key={loc.id}
                  description={loc.name}
                  subtitle={getLocationSubtitle(loc)}
                  date={formatDate(loc.createdAt)}
                  icon={<Boxes className="h-6 w-6" />}
                  onClick={() => navigate(`/space/${loc.id}`)}
                />
              ))}
            </div>
          ) : null}

          {matchedItems.length > 0 ? (
            <div>
              <SectionHeader title="Items" count={matchedItems.length} />
              {matchedItems.map((item) => (
                <StorageRow
                  key={item.id}
                  description={item.name}
                  subtitle={getItemSubtitle(item)}
                  date={formatDate(item.createdAt)}
                  photoUrl={item.photo}
                  icon={<Package className="h-6 w-6" />}
                  onClick={() => navigate("/")}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
