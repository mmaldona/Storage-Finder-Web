# StorageFinder — Project History

A running log of every change made to the app. Every new feature, modification,
or removal gets a new dated entry below explaining **what** changed and **why**.

Entries are listed newest first. Dates are in `YYYY-MM-DD` format.

---

## [2026-05-03] FAB Speed Dial — Vertical Stack with Labels

Replaced the arc/semicircle speed dial with a clean vertical stack that animates up from the FAB on hold.

**Layout:**
- Each option row: 52px white circle icon (blue icon, soft shadow) + plain text label to its left
- Label: `#1a1a1a`, 15px, weight 500, white text-shadow for legibility over any background
- Row minimum touch target: 60px height; 20px gap between rows; 20px clearance above FAB top edge
- Stack right-edge-aligned, icon buttons centered over the FAB

**Animation:**
- Open: options slide up (`translateY(20px → 0)`) and fade in, 60ms stagger per item, 140ms duration each
- Close: all items fade out and slide down simultaneously (120ms)
- Overlay: `rgba(0,0,0,0.2)`, tap to dismiss

**Options per screen:**
- Home screen (bottom→top): Search, Add Item, Generate QR
- Place/Location screen (bottom→top): Search, Scan QR, Add Item, Generate QR

**Removed:** `ARC_RADIUS`, `getAngles()`, `getOptionPos()`, `getTransformOrigin()` arc helpers

---

## [2026-05-03] FAB Speed Dial — Upper-Right Arc, Icons Only, QrPrint Button

Reworked the speed dial arc direction, removed all option labels, and added a custom QR-print icon.

**Arc direction changed:**
- Previous arc fanned upper-left at angles 90°, 135°, 180° (12 o'clock to 9 o'clock)
- New arc fans upper-right at angles 90°, 45°, 0° for 3 options and 90°, 60°, 30°, 0° for 4 options (12 o'clock to 3 o'clock)
- `getAngles(count)` helper added to return the correct angle array based on option count
- `getTransformOrigin(angleDeg)` helper added to set appropriate scale-animation origin per angle

**Labels removed:**
- All `label` fields removed from `SpeedDialOption` interface
- Option buttons now render icon only (48px white circle, blue icon); no pill label to the side
- `IconComponent` type alias added (`React.ComponentType<any>`) to accommodate both Lucide icons and the custom SVG component

**New QrPrintIcon component:**
- Custom inline SVG component (`QrPrintIcon`) added at the top of the file
- Renders a QR-code-plus-printer icon (three QR corner squares, dot matrix, printer body with paper feed)
- Accepts `size` and `color` props matching the Lucide icon interface

**Home screen arc (3 options — no location context):**
- Search, Package (Add Item), QrPrintIcon (Generate QR)
- Replaces previous: Plus (Add Location), Search, Package

**Place list arc (4 options — `/location/:id` context):**
- Search, QrCode (Scan QR), Package (Add Item), QrPrintIcon (Generate QR)
- Replaces previous: QrCode, Search, Package (3 options)

---

## [2026-05-03] Fix: ScanQR — Remove idle/intermediate screen

Removed the idle state ("Start Camera" screen) from `ScanQR.tsx` entirely.

- `ScanState` type reduced to `"scanning" | "success" | "error"` — `"idle"` removed
- Component now mounts directly into the live camera view; no intermediate prompt
- `handleCancel` changed from `setScanState("idle")` to `navigate(-1)` — Cancel always returns the user to wherever they came from (Home or a Place screen)
- The "Try Again" button in the error state still restarts the scanner correctly

---

## [2026-05-03] Fix: ScanQR — Auto-start camera + terminology

**Bug 1 — Skip intermediate screen:** Changed initial `scanState` from `"idle"` to `"scanning"` in `ScanQR.tsx`. The existing `useEffect` that depends on `scanState` initializes `Html5Qrcode` as soon as the component mounts, so the camera view opens immediately with no "Start Camera" tap required. The idle state is still reachable after pressing Cancel, where "Start Camera" acts as a manual restart.

**Bug 2 — Stale terminology:** Replaced "Storage Space" with "Location or Place" in the idle-state descriptive text. Updated the success handler to navigate to `/location/:id` (LocationDetail) instead of the legacy `/space/:id` route.

---

## [2026-05-03] Context-Aware FAB + Bottom Nav Removal

Replaced the 5-tab bottom navigation bar with a context-aware floating action button (FAB) featuring a semicircle speed dial menu.

**Bottom nav removed:**
- Deleted `BottomNav` from `AppShell.tsx`; `pb-24` → `pb-[100px]` on the main shell container
- Removed the "+ Add Location" fixed button from `MyStuff.tsx` (empty state and list state)
- Removed sticky bottom "Add" / "Add Shelf" / "Add Item" bars from `LocationDetail`, `StorageSpaceDetail`, and `ShelfDetail`; replaced with `paddingBottom: calc(100px + env(safe-area-inset-bottom))` on scrollable content

**New component: `src/components/FAB.tsx`**
- Fixed circle, 62px, `#1E6FD9`, bottom-right corner (28px / 24px from edges)
- Shadow: `0 4px 16px rgba(30,111,217,0.45)`
- Hidden on all creation/edit form routes (new-space, new-shelf, new-item, add-item-choice, all edit routes, new-location)
- Single tap: executes context action. Hold 500 ms: opens speed dial (icon rotates 45°)

**Context A — Home and all non-detail screens:**
- Default icon: QrCode — single tap opens `/scan`
- Speed dial options: Plus → `/new-space`, Search → `/search`, Package → `/add`

**Context B — Location Detail (`/location/:id`):**
- Default icon: Plus — single tap opens `/location/:id/new-location` (Add Place)
- Speed dial options: QrCode → `/scan`, Search → `/search`, Package → `/space/:spaceId/shelf/:shelfId/add-item-choice`

**Speed dial design:**
- 3 option buttons (48px white circles, blue icon) fan in a 90° arc above-left of the FAB at angles 90°, 135°, 180° with radius 90px
- Labels: white pill, dark text, soft shadow, rendered to the left of each button
- Semi-transparent overlay `rgba(0,0,0,0.3)` — tap to close
- CSS spring-like transitions (`cubic-bezier(0.34,1.56,0.64,1)`) with 40 ms stagger between buttons
- FAB icon rotates 45° on open via CSS transition

**Placed globally** in `App.tsx` inside `<BrowserRouter>` (after `<Routes>`) so it has access to routing context on every page.

---

## [2026-05-03] Fix: LocationForm title derivation

Replaced the `title: string` prop on `LocationForm` with two props — `parentId: string | null` and `isEditing: boolean` — so the form derives its own title from context:

- `parentId null + isEditing false` → **"New Location"**
- `parentId null + isEditing true` → **"Edit Location"**
- `parentId set + isEditing false` → **"New Place"**
- `parentId set + isEditing true` → **"Edit Place"**

Updated all 7 callers: `NewShelf`, `EditShelf`, `NewSubLocation`, `LocationEdit`, `EditStorageSpace`, and both forms in `NewStorageSpace`.

---

## [2026-05-03] ViewToggle — Text word button

Replaced the icon-only toggle with a single tappable word in `src/components/ViewToggle.tsx`.

- **List mode** → shows "Cards" in `#1E6FD9` (tap to switch)
- **Cards mode** → shows "List" in `#1E6FD9` (tap to switch)
- `text-xs font-medium`, 44×44px touch target via `px-3 py-3`
- No icon, no container, no border

---

## [2026-05-03] Fix: Place creation Done/Finish navigation

After creating a Place, the "Done" button (and backdrop tap) in the post-save modal was navigating to the newly created Place's own detail screen (`/location/${newPlace.id}`) instead of the parent Location where that Place appears in the list.

**Root cause:** After saving a Place, `currentParent` is overwritten with the new Place. Both `Done` handlers were reading `currentParent.id`, which by that point pointed to the new Place itself, not its parent.

**`NewSubLocation.tsx`:** The parent is always `activePlaceParentId` (the URL param, updated when nesting deeper). Changed both `Done` and backdrop to navigate to `/location/${activePlaceParentId}`.

**`NewStorageSpace.tsx`:** Added `lastPlaceParentId` state. In the place-form `onSave`, `parentId` is captured before `currentParent` is overwritten, then stored in `lastPlaceParentId`. Both `Done` and backdrop navigate to `/location/${lastPlaceParentId}` (or `/` if unset, as a safe fallback).

---

## [2026-05-03] Fix: Location Edit Photo Bugs (3 fixes)

**Bug 1 & 2 — Photo not shown / not saved on root Location edit:**
- Root locations on the Home screen were routed to `/space/:id/edit` → `EditStorageSpace`, which did not pass `initialPhoto` to `LocationForm` and did not include `photo` in the `updateLocation` call. Photo was blank on open and silently dropped on save.
- Fix: `MyStuff.tsx` swipe-edit now routes to `/location/:id/edit` (LocationEdit) instead of `/space/:id/edit`.
- Fix: `EditStorageSpace.tsx` now passes `initialPhoto={space.photo}` and saves `photo` in `updateLocation`, as a safety net for any remaining `/space/:id/edit` entrypoints.

**Bug 3 — Wrong post-save navigation:**
- `LocationEdit.tsx` was navigating to `/location/${id}` (the location's own detail page) after save.
- `EditStorageSpace.tsx` was navigating to `/space/${id}` (the old storage space detail) after save.
- Fix: Both now navigate to `"/"` (main Location list) for root locations (`parentId === null`), or to `/location/${parentId}` for Places, so the user sees their updated row immediately.

---

## [2026-05-03] PhotoField Component — Standardized Photo UI for Locations/Places

Replaced the two-button ("Take a Photo" / "Choose from Library") photo UI with a single reusable `PhotoField` component used across all Location and Place create/edit forms.

**New component: `src/components/PhotoField.tsx`**
- Empty state: full-width 160px dashed-border tap target, centered camera icon, "Add Photo" label
- Tapping opens the native OS file picker (`accept="image/*"`) — camera, photo library, and files available via OS sheet
- Photo state: inline preview (`h-40`, full-width, `object-cover`) + action bar with "Change Photo" (camera icon, dark) and "Remove Photo" (red)
- "Change Photo" re-opens the same native picker
- Images resized to max 600px JPEG 0.7 before storing (same quality as Item photos)
- Self-contained: manages its own file input ref and processing state; exposes `value`/`onChange` props

**`LocationForm.tsx` simplified:**
- Removed three separate hidden inputs (`cameraInputRef`, `libraryInputRef`, `changeInputRef`) and all inline photo logic
- Now uses `<PhotoField value={photo} onChange={setPhoto} />` — one line
- All callers unchanged (same props interface)

---

## [2026-05-03] Location/Place Photo Support

Added an optional photo field to all Location and Place create/edit forms, with display in both List and Card views.

**Data model:**
- Added `photo?: string` (base64 JPEG) to the `Location` interface in `StorageSpacesContext.tsx`
- Updated `restoreLocation` to preserve the `photo` field when restoring from Recently Deleted

**Form changes (`LocationForm.tsx`):**
- Added `initialPhoto?: string` prop and `photo` state
- Photo field below Notes: two dashed-border buttons ("Take a Photo" with camera input `capture="environment"`, "Choose from Library" with standard file input)
- When a photo is set: inline 48-height preview + "Change Photo" (camera icon) + "Remove Photo" (red X) action row
- Image resized to max 600px JPEG 0.7 quality before saving (same as Item photo logic)
- `onSave` callback extended to include `photo?: string`

**Callers updated to pass photo through:**
- `NewStorageSpace.tsx` — both Location form and Place form `onSave` calls
- `NewSubLocation.tsx` — Place form `onSave` call
- `LocationEdit.tsx` — passes `initialPhoto={loc.photo}` and saves `photo` on update

**Display:**
- `MyStuff.tsx` (`LocationRowContent`) — shows 56×56px photo thumbnail when `loc.photo` is set; falls back to MapPin icon in blue-50 background
- `MyStuff.tsx` (CardGrid) — passes `photoUrl={loc.photo}` to `CardItem`
- `LocationDetail.tsx` — passes `photoUrl={child.photo}` to both `StorageRow` and `CardItem` for child locations (Places Inside section)

---

## [2026-05-03] ViewToggle — Single Icon Button (Opposite State)

Replaced the segmented List/Cards toggle with a single icon-only button that shows the icon for the opposite view.

- **List mode active** → shows `LayoutGrid` icon (tap to switch to Cards)
- **Cards mode active** → shows `List` icon (tap to switch to List)
- Icon: 22×22px, `#1a1a1a`, `strokeWidth={1.75}`, no background/border/shadow
- Touch target: 44×44px via 11px padding on all sides
- Placement unchanged; persistence logic unchanged

---

## [2026-05-03] ViewToggle — Native iOS Segmented Control Style

Redesigned the List/Cards segmented toggle in `src/components/ViewToggle.tsx` to match the native iOS segmented control aesthetic.

- **Outer container**: pill-shaped, light gray background (`#F2F2F7`), no border, 2px inner padding
- **Active segment**: white background with a soft multi-layer box shadow (elevation), dark text (`#1a1a1a`)
- **Inactive segment**: gray text (`#8E8E93`), no background
- **Transition**: smooth 200ms on all properties
- No bright color fills, no hard borders — feels native and minimal
- Placement, behavior, and persistence logic unchanged

---

## [2026-05-03] Primary Color Change — Teal → Blue

Replaced the teal primary color (#2D7D9A) with the new brand blue (#1E6FD9) across the entire app.

**Color tokens:**
- Primary (buttons, active nav, icons, toggles): `#1E6FD9`
- Pressed/active state: `#1559B0`
- Light accent (icon backgrounds, hover states): `#4FA3FF` / `bg-blue-50`

**Files changed:**
- `src/index.css` — updated `--primary`, `--accent`, `--ring`, `--sidebar-primary`, `--sidebar-ring` CSS variables from HSL `174 72% 36%` to `214 76% 48%` (both `:root` and `.dark` selectors)
- `src/components/ViewToggle.tsx` — active segment changed from `#2D7D9A` to `#1E6FD9`
- `src/pages/MyStuff.tsx` — MapPin icon bg/color and "+ Add Location" button updated
- `src/pages/LocationDetail.tsx` — "+ Add" sticky bottom button updated
- `src/components/LocationForm.tsx` — Save button updated
- `src/pages/NewItem.tsx` — Save button, Regenerate link, AI spinner updated
- `src/pages/EditItem.tsx` — Regenerate link, AI spinner updated

No layout, spacing, or text colors were changed.

---

## [2026-05-02] List/Card View Toggle

Added a List/Card view toggle to all listing screens. Users can switch between a standard row list and a 2-column card grid per screen, and the preference is saved to localStorage so it persists after reload.

**Screens updated:**
- **My Locations** (`MyStuff.tsx`) — toggle placed on the count row inside the header (`4 locations [ List | Cards ]`)
- **Location Detail** (`LocationDetail.tsx`) — toggle placed on the breadcrumb row (right-aligned). When no breadcrumb is visible, the toggle row is still rendered on the right. Both "Places Inside" and "Items" sections switch together.
- **Storage Space Detail** (`StorageSpaceDetail.tsx`) — toggle on the Shelves/Sections count row
- **Shelf Detail** (`ShelfDetail.tsx`) — toggle on the Items count row

**New components/hooks:**
- `src/hooks/useViewMode.ts` — reads/writes `storagefinder_viewmode_[screenId]` to localStorage; defaults to list
- `src/components/ViewToggle.tsx` — segmented `[ List | Cards ]` control; active segment is teal (#2D7D9A)
- `src/components/CardItem.tsx` — individual card with image/icon (square aspect ratio), bold name, subtitle, date
- `src/components/CardGrid.tsx` — 2-column `grid-cols-2` wrapper with 12px gap

**Behavior:**
- List mode: unchanged (uses existing `StorageRow` + `SwipeableRow`)
- Card mode: `CardGrid` + `CardItem` — no swipe-to-delete (grid layout incompatible)
- Empty state text preserved in both modes
- No impact to header, QR icon, navigation, or creation flows

**localStorage key format:** `storagefinder_viewmode_root`, `storagefinder_viewmode_location_[id]`, `storagefinder_viewmode_space_[id]`, `storagefinder_viewmode_shelf_[id]`

---

## [2026-05-02] 7-Bug Fix Pass — Location Detail & Related Screens

- **BUG 1 — Button label confirmed**: Bottom button on every Location Detail / Place Detail screen says "+ Add" (Plus icon + "Add" text). No "Add Item" suffix anywhere.
- **BUG 2 — Modal vertical centering**: Both modals (Add modal in LocationDetail, post-save modal in NewSubLocation) now render **outside** the `overflow-hidden` container. LocationDetail uses a React Fragment so modals are siblings of the main div; NewSubLocation returns the modal overlay directly (no outer wrapper). Inline `style` props reinforce `position:fixed / inset:0 / display:flex / align-items:center / justify-content:center` to guarantee true center on all screen sizes including iOS WebKit.
- **BUG 3 — parentId at deep nesting levels**: Verified correct — LocationDetail passes `id` (from `useParams`) as `parentId` in the URL when navigating to `/location/:parentId/new-location`; NewSubLocation reads it via `useParams`. Works correctly at 3, 4, 5+ levels.
- **BUG 4 — Modal context at deep nesting levels**: Verified correct — Add modal uses `loc.name` (current screen's location); post-save modal uses `savedPlace.name` (newly created place). Both dynamically read from current objects, never cached.
- **BUG 5 — Breadcrumb on all Place screens**: Verified correct — LocationDetail calls `getLocationPath(id)`, splits on " > ", and shows breadcrumb whenever `pathSegments.length > 1` (depth > 1). Root locations show no breadcrumb.
- **BUG 6 — Back button navigation**: Verified correct — LocationDetail's `handleBack` navigates to `navigate('/')` when `parentId` is null, or `navigate('/location/' + parentId)` otherwise. Never uses `navigate(-1)`.
- **BUG 7 — Cancel button on Add Item choice screen**: Added a gray outlined full-width Cancel button below the Skip Photo option in `AddItemChoice.tsx`. Navigates to `/location/${shelfId}` (the Place screen the user came from).

---

## [2026-05-01] Location Detail Screen — Modal Style & Label Fixes

- **Centered floating modals**: Both action modals (Modal A on "+ Add", Modal B after saving a Place) converted from bottom sheets to centered floating modals — white bg, `rounded-2xl`, `shadow-xl`, `p-6` padding, `bg-black/50` overlay; tapping overlay dismisses
- **Context-aware labels**: Modal A options now include the current location name ("Create a Place in [Name]", "Create an Item in [Name]"); Modal B uses the newly saved place name ("Create an Item in [Name]")
- **No modal titles**: Removed "What's next?" header from Modal B; neither modal has a title/header
- **Cancel/Done in gray**: Cancel and Done options use gray text; all other options use `#1a1a1a`
- **Button label confirmed**: Bottom "+ Add" button label is "+ Add" with no context suffix

---

## [2026-05-01] Location Detail Screen — Place UI Refactor

- **Renamed child-location label** throughout LocationDetail: section header changed from "Locations Inside" to "PLACES INSIDE"; nested locations are now called "Places" everywhere on this screen
- **Single "+ Add" button** replaces the previous two-button bottom bar (Add Location + Add Item); tapping it shows a bottom-sheet action modal with "Create a Place", "Create an Item", and "Cancel" options
- **Removed inline "+ Add Location" button** that previously appeared inside the PLACES INSIDE list — the single bottom button covers both actions
- **Items count always shown** (section 2 now shows count even when 0); PLACES INSIDE count always shown
- **Post-save modal in `NewSubLocation.tsx`**: after saving a new place, instead of navigating away immediately, a bottom-sheet modal appears with "Create an Item in [Name]", "Create another Place", and "Done" options; returning to parent on "Done"
- **Form title updated**: "New Location" → "Create a Place" in `NewSubLocation.tsx`

---

## [2026-05-01] Location Detail Screen — Universal Location View

- **Replaced `LocationDetail.tsx` placeholder** with a full implementation at `/location/:id` that works for ALL locations at ALL nesting depths; supersedes `StorageSpaceDetail` and `ShelfDetail` as the primary detail view
- **Header**: back button (navigates to parent location or `/` if root), bold location name + gray area subtitle, QR code button (top right) — reuses existing `QRCodeModal`
- **Breadcrumb**: shown below header only when depth > 1 (e.g. "Garage › South Wall › Shelf 1"); current segment bold, ancestors gray; hidden for root locations
- **Section 1 — LOCATIONS INSIDE**: label + count + swipeable child location rows; hidden entirely when no sub-locations exist; "+ Add Location" outline button at bottom of list
- **Section 2 — ITEMS**: always shown; "No items here yet." empty state; swipeable item rows with photo thumbnails
- **Swipe left on any row**: Edit (yellow) → navigate to edit form; Delete (red) → soft-delete with confirmation dialog
- **Sticky bottom bar**: "+ Add Location" outline button (shown only when no sub-locations, so the button is always reachable); "+ Add Item" teal primary button always at bottom
- **Item navigation**: tapping or swiping Edit on an item routes to existing edit item screen (Add Item flow unchanged per spec)
- **Created `pages/LocationEdit.tsx`**: edit any location, navigates back to `/location/:id` after save; used from LocationDetail's sub-location swipe Edit
- **Created `pages/NewSubLocation.tsx`**: create sub-location of any parent, navigates back to `/location/:parentId`; used from LocationDetail's "+ Add Location" button
- **`App.tsx`** updated: added imports and routes for `LocationEdit` (`/location/:id/edit`) and `NewSubLocation` (`/location/:parentId/new-location`)
- Existing routes (`/space/:id`, `/space/:id/shelf/:shelfId`, etc.) preserved for backward compatibility with Add Item / Edit Item flows

---

## [2026-05-01] Reusable LocationForm Component

- **Created `components/LocationForm.tsx`** — single reusable form component used for all location create/edit flows; replaces four duplicate form implementations
- **Fields**: Name (required, inline error), Area (optional, placeholder "e.g. Kitchen, Basement"), Notes (optional, multi-line textarea)
- **Layout**: back button (top-left) + screen title in header; Save (teal) and Cancel (outline) buttons inline below Notes field
- **Props**: `title` ("New Location" or "Edit Location"), `initialName/Area/Notes` for edit pre-fill, `onSave(data)` callback, `onCancel` callback — all navigation and context calls live in the page wrapper, not the form
- **Updated `NewStorageSpace.tsx`**: now wraps LocationForm with `parentId: null` → navigates to `/` on save
- **Updated `NewShelf.tsx`**: now wraps LocationForm with `parentId: spaceId` → navigates to `/space/:id` on save; Area field now included (previously missing from shelf form)
- **Updated `EditStorageSpace.tsx`**: now wraps LocationForm with pre-filled values; title changed from "Edit Storage Space" to "Edit Location"
- **Updated `EditShelf.tsx`**: now wraps LocationForm with pre-filled values; title changed from "Edit Shelf" to "Edit Location"; Area field now included
- No changes to App.tsx, MyStuff, StorageSpaceDetail, ShelfDetail, or any other non-form screen

---

## [2026-04-30] Home Screen Rebuilt — My Locations

- **`MyStuff.tsx`** fully rebuilt against the new location data model; all old `storageSpaces` references removed
- **Title** changed to "My Locations"
- **Data source**: `getRootLocations()` — only shows locations where `parentId` is null
- **Row design** (3 lines): bold name · area (if set) · "Added today" or formatted date; teal `MapPin` icon on the left; chevron on the right
- **Empty state**: MapPin icon + "No locations yet. Create your first one." + teal "+ Add Location" button
- **Swipe left** (via existing `SwipeableRow`): yellow Edit button → `/space/:id/edit`; red Delete button → `deleteLocation()` with confirmation dialog (soft delete)
- **Tap** navigates to `/location/:id`
- **"+ Add Location" button** always rendered at the bottom (sticky, above the bottom nav), regardless of list length; navigates to `/new-space`
- **`LocationDetail.tsx`** created as a placeholder page at `/location/:id` — shows location name, area, and notes; full detail screen to be built next
- **`App.tsx`** updated: added `import LocationDetail` and `<Route path="/location/:id" element={<LocationDetail />} />`

---

## [2026-04-30] Unified Location Data Model (Context Rebuild)

- **Replaced the three-model data structure** (`storageSpaces`, `shelves`, `items`) with a two-array unified model (`locations`, `items`) in `StorageSpacesContext.tsx`
- **New `Location` interface**: `{ id, name, area?, notes?, parentId: string | null, createdAt, updatedAt }` — `parentId: null` means root level; non-null means a child of another location, enabling infinite nesting
- **Updated `Item` interface**: `locationId: string | null` replaces `shelfId`/`spaceId`; `photo` replaces `photoUrl`; added `updatedAt`
- **Unified `recentlyDeleted` array**: replaces three separate deleted arrays (`deletedSpaces`, `deletedShelves`, `deletedItems`); each entry has a `_type: "location" | "item"` discriminator
- **New localStorage keys**: `storagefinder_locations_v1`, `storagefinder_items_v3`, `storagefinder_deleted_v1`
- **Migration on first load**: old keys (`storagefinder_spaces_v2`, `storagefinder_shelves_v2`, etc.) are cleared; existing items are migrated with `locationId: null` (orphaned) and `photoUrl` renamed to `photo`
- **New context methods**: `addLocation`, `updateLocation`, `deleteLocation` (cascades to descendants + their items), `getChildLocations(parentId)`, `getRootLocations()`, `getLocationPath(id)` (returns e.g. `'Garage > South Wall > Shelf 1'`), `getItemsForLocation(locationId)`, `restoreLocation`, `restoreItem`, `permanentlyDelete`
- **All UI pages updated** to compile against the new API (mechanical renames; visual UI unchanged — full UI redesign is a separate step)
- **`RecentlyDeleted` page** rewired to use unified `recentlyDeleted` array with path resolution across active + deleted locations
- **`SearchPage`** now searches `locations` and `items`; section header renamed from "Storage Spaces / Shelves" to "Locations"

---

## [2026-04-27] Recently Deleted Screen

- **Profile tab** now shows a "Recently Deleted" row (red trash icon, chevron, live count of deleted items) that navigates to `/recently-deleted`
- **RecentlyDeleted page** (`src/pages/RecentlyDeleted.tsx`): lists all soft-deleted Storage Spaces, Shelves, and Items sorted by `deletedAt` descending (newest first)
- Each row shows:
  - Line 1: Bold name
  - Line 2: Type badge pill ("Storage Space", "Shelf", or "Item") + location path ("In [Space]" for shelves; "[Space] › [Shelf]" for items)
  - Line 3: "Permanently deletes in N days" in amber
- **Swipe-left row actions** via new `SwipeableDeletedRow.tsx` component:
  - **Restore** (green `#10B981`): moves item back to its active array in localStorage and context state
  - **Delete** (red `#EF4444`): shows confirmation "Permanently delete [Name]? This cannot be undone." → removes from deleted array permanently
- **Auto-cleanup on startup**: deleted arrays (`storagefinder_deleted_spaces/shelves/items`) are pruned of any entries older than 30 days when `StorageSpacesProvider` mounts
- **Context changes** (`StorageSpacesContext.tsx`): deleted arrays (`deletedSpaces`, `deletedShelves`, `deletedItems`) are now stateful; delete methods (`deleteSpace`, `deleteShelf`, `deleteItem`) update deleted state in addition to localStorage; added `restoreSpace`, `restoreShelf`, `restoreItem`, `permanentlyDeleteSpace`, `permanentlyDeleteShelf`, `permanentlyDeleteItem`; exported `DeletedSpace`, `DeletedShelf`, `DeletedStorageItem` types
- No other screens or functionality were modified

---

## [2026-04-27] Fix QR Scan Camera Init + Print/Save Image on QRCodeModal

- **Fix 1 — Camera not opening (ScanQR.tsx):** Scanner initialization moved into a `useEffect` that runs only after `scanState === "scanning"`, ensuring the `#qr-reader` DOM element exists before `Html5Qrcode` is instantiated. Camera permission is now requested explicitly via `navigator.mediaDevices.getUserMedia` before state changes; if denied, shows "Camera access is required to scan QR codes. Please allow camera access in your browser settings."
- **Fix 2 — Print on iOS (QRCodeModal.tsx):** Replaced `window.print()` with `window.open('', '_blank')` approach: opens a new tab, writes a minimal HTML page containing the QR code image, then calls `printWindow.print()` after a 300 ms delay. Works with AirPrint on iOS Safari.
- **Fix 3 — Save Image button (QRCodeModal.tsx):** Added a gray outlined "Save Image" button below Print. Converts the QR canvas to a PNG data URL; on iOS opens it in a new tab (user can long-press to save); on all other platforms triggers a `<a download>` click to save `[SpaceName]-QR.png`.
- No other screens or functionality were modified

---

## [2026-04-27] QR Code Generation + Scan QR Tab

- **QR code button** added to the Storage Space Detail header (QrCode icon, top-right)
- Tapping it opens a modal (`QRCodeModal.tsx`) showing:
  - Storage Space name as title
  - Large generated QR code (240 px canvas via `qrcode` library)
  - Encoded value: `storagefinder://space/[id]`
  - Teal **Print** button (`window.print()`)
  - X button to dismiss; tapping backdrop also closes
- **Scan QR tab** (`ScanQR.tsx`) rebuilt from placeholder into a live camera scanner using `html5-qrcode`:
  - Idle state: prompt with "Start Camera" button
  - Scanning state: full-screen camera feed with teal corner-frame overlay + **Cancel** button
  - Valid StorageFinder QR (`storagefinder://space/[id]`): shows green success banner "Opened: [Space Name]" then navigates to that space after 1.2 s
  - Unrecognized QR: shows red error "This QR code is not from StorageFinder" with **Try Again** + **Cancel**
  - Camera permission denied: shows error message with **Try Again**
- Installed `qrcode@1.5.4`, `html5-qrcode@2.3.8`, `@types/qrcode@1.5.6`
- No other screens or functionality were modified

---

## [2026-04-27] Fix Global Search — Match Own Fields Only (No Parent Cascade)

- **Storage Spaces** match on: name, area, notes only
- **Shelves** match on: shelf name, shelf notes only — parent space name/area/notes are NOT searched
- **Items** match on: item name, item notes only — parent shelf and space fields are NOT searched
- The location path shown on result rows (e.g. "Game Closet > Top Shelf") is display-only and is never used as a search field
- Example: searching "Basement" returns only spaces named/area'd/noted "Basement" — not every shelf and item inside it
- Simplified `shelfMatches` and `itemMatches` to remove parent-cascade logic; unused map arguments removed from signatures

---

## [2026-04-27] Rebuild Global Search — All Types with Grouped Results

- **Search scope expanded** to all four levels: Storage Spaces, Shelves, Items, and location paths
- **Storage Spaces** match on: name, area, notes
- **Shelves** match on: name, notes, or their parent space's name/area/notes
- **Items** match on: name, notes, or their parent shelf's name/notes, or grandparent space's name/area/notes
- Location-path search: e.g. typing "basement" surfaces every space, shelf, and item inside a space named "Basement"
- **Results grouped** into three labeled sections: STORAGE SPACES / SHELVES / ITEMS, each with a count badge
- Storage Space rows show: name, area + item count subtitle (e.g. "Garage · 12 items"), date
- Shelf rows show: name, parent space name + item count subtitle (e.g. "Living Room · 3 items"), date, Layers icon
- Item rows show: photo or Package icon, name, full location path (Space > Shelf), date
- **Tapping** a Space navigates to `/space/:id`; a Shelf to `/space/:spaceId/shelf/:id`; an Item to its shelf detail
- **Empty input state:** "Start typing to search everything"
- **No results state:** `No results for "[query]"`
- No other screens or functionality were modified

---

## [2026-04-27] Global Search Screen (initial)

- Built the Search tab (`/search` → `SearchPage.tsx`) as a fully functional global search screen
- **Search input:** Large, auto-focused search field at top of screen with placeholder "Search items, notes, and locations..."; searches on every keystroke (no Enter needed)
- **Search scope:** Searches across all items in all storage spaces and shelves; matches against both item Name and Notes fields; results sorted newest first
- **Result rows** use the standard `StorageRow` design: small square photo (or gray Package icon placeholder), bold item name on line 1, full location path (e.g. "Game Closet > Top Shelf") on line 2, formatted created date on line 3
- **Tapping a result** navigates to that item's Shelf Detail screen (`/space/:spaceId/shelf/:shelfId`)
- **Empty state (no query):** centered Search icon + "Start typing to search your items"
- **No results state:** centered Search icon + `No items found for "[query]"`
- Result count shown in section header (e.g. "3 items")
- No other screens or functionality were modified

---

## [2026-04-27] Fix: Swipe Button Bleed-Through on Initial Render

- **Root cause:** On first render, the Edit/Delete buttons behind swipeable rows were briefly visible through the row content due to missing GPU compositing and transparent row background.
- **Fix applied in `SwipeableRow.tsx`:** (1) Action button container set to `z-index: 0`; (2) Sliding row content given `position: relative`, `z-index: 1`, and `background-color: white` so it fully covers buttons behind it; (3) Added `will-change: transform` to the sliding element to force GPU compositing and prevent bleed-through on initial render.
- No functionality changes — swipe gestures, Edit/Delete actions, and confirmation dialogs are unchanged.

---

## [2026-04-27] Bug Fixes: Swipe Reset on Navigation + Shelf Detail Subtitle

- **Swipe state reset (Home, Storage Space Detail, Shelf Detail):** SwipeableRow keys now incorporate the React Router location key and current list length (`${location.key}-${list.length}-${item.id}`). This forces all rows to remount (resetting their swipe offset to closed) whenever the screen is navigated to or the list size changes — no row will show Edit/Delete buttons on initial render.
- **Shelf Detail header subtitle:** Changed from showing `shelf.notes` to showing the parent Storage Space name (e.g. "Game Closet"). The `spaces` array is now also pulled from context in `ShelfDetail` and the matching space is looked up by `spaceId`.

---

## [2026-04-27] Swipe-Left Actions on All List Rows

- Created `SwipeableRow.tsx` component — wraps any row with touch-based swipe-left gesture support; swiping left reveals two action buttons: **Edit** (yellow `#F59E0B`) and **Delete** (red `#EF4444`); swiping right or tapping outside automatically closes them
- Delete button shows an `AlertDialog` confirmation: "Delete '[Name]'? It will be moved to Recently Deleted." — cancelling leaves the row unchanged
- Soft delete: deleted items are moved to separate `storagefinder_deleted_spaces/shelves/items` arrays in localStorage with a `deletedAt` timestamp; they are removed from the active lists immediately
- Cascading deletes: deleting a Storage Space also soft-deletes its shelves and their items; deleting a Shelf also soft-deletes its items
- Applied `SwipeableRow` to three screens:
  - **Home** (Storage Space list) — Edit navigates to `/space/:id/edit`, Delete soft-deletes the space
  - **Storage Space Detail** (Shelf list) — Edit navigates to `/space/:id/shelf/:shelfId/edit`, Delete soft-deletes the shelf
  - **Shelf Detail** (Item list) — Edit navigates to the existing `/space/:id/shelf/:shelfId/item/:itemId/edit`, Delete soft-deletes the item
- Created `EditStorageSpace.tsx` (`/space/:id/edit`) — pre-filled form with Name, Area, Notes; calls `updateSpace` on save
- Created `EditShelf.tsx` (`/space/:id/shelf/:shelfId/edit`) — pre-filled form with Shelf Name, Notes; calls `updateShelf` on save
- Added `updateSpace`, `deleteSpace`, `updateShelf`, `deleteShelf`, `deleteItem` methods to `StorageSpacesContext`
- Wired `/space/:id/edit` and `/space/:id/shelf/:shelfId/edit` routes in `App.tsx`

---

## [2026-04-26] AI Photo Naming on Add & Edit

- Added `/api/analyze-image` backend route (`backend/src/routes/analyze-image.ts`) powered by Claude vision
- Installed `@anthropic-ai/sdk` in the backend; added `ANTHROPIC_API_KEY` to env validation
- **New Item screen:** after choosing a photo, AI auto-fills the Item Name field; a "Regenerate" button lets the user re-run analysis
- **Edit Item screen:** same AI naming button available when a photo is present (new or existing)
- Both screens show a loading spinner while the API call is in-flight

---

## [2026-04-26] Save Button Position Fixed on All Creation Screens

- Moved the Save/Cancel button pair from a fixed bottom bar to inline below the last form field on all three creation screens: New Storage Space, New Shelf, and New Item
- Prevents the keyboard from obscuring the buttons on mobile

---

## [2026-04-26] Add Item Choice Screen + Photo-Optional Flow

- Created `AddItemChoice.tsx` (`/space/:id/shelf/:shelfId/add-item-choice`) — an intermediate screen offering two paths: **Take Photo** (recommended, triggers camera capture) or **Skip Photo** (goes straight to the form)
- `ShelfDetail` "Add Item" button now navigates to this choice screen instead of directly to `NewItem`
- `NewItem` updated to accept optional pre-captured photo data passed via router state; photo field is no longer required
- Image resizing (max 600 px) moved into `AddItemChoice` before navigation so `NewItem` always receives an already-optimised blob

---

## [2026-04-26] Edit Item Screen + Make Photo Optional

- Created `EditItem.tsx` (`/space/:id/shelf/:shelfId/item/:itemId/edit`) — mirrors New Item layout with pre-filled fields; supports changing or removing the photo
- Added `updateItem` and `deleteItem` methods to `StorageSpacesContext`; items persisted in localStorage under `storagefinder_items`
- `ShelfDetail` item rows now show a tappable edit icon that navigates to `EditItem`
- Photo is optional on both Add and Edit; form validates only that Item Name is non-empty

---

## [2026-04-26] Add Item Flow (Shelf Detail + New Item)

- Created `ShelfDetail.tsx` (`/space/:id/shelf/:shelfId`) — lists items on a shelf with photo thumbnails, names, notes, and creation dates; empty state shown when no items exist; "Add Item" button pinned at bottom
- Created `NewItem.tsx` (`/space/:id/shelf/:shelfId/new-item`) — form with Item Name (required), Notes (optional), and Photo (camera capture with canvas resize); Save navigates back to shelf
- Added `Item` model (`id`, `shelfId`, `name`, `notes?`, `photo?`, `createdAt`) to `StorageSpacesContext`
- Added `addItem` method to context; items array available globally
- Wired `/space/:id/shelf/:shelfId` and `/space/:id/shelf/:shelfId/new-item` routes in `App.tsx`
- `StorageSpaceDetail` shelf rows now navigate to their `ShelfDetail`

---

## [2026-04-26] Home Screen & Row UI Clean-up

- Restored "+ Create storage space" label on Home screen (was briefly "+ Add")
- `StorageRow` photo thumbnail now shows a fallback package icon with a light gray background instead of a broken image
- `StorageSpaceDetail` header back-button alignment corrected

---

## [2026-04-26] Shelf Creation & Navigation

- Added `Shelf` model (`id`, `spaceId`, `name`, `notes?`, `createdAt`) to `StorageSpacesContext` with localStorage persistence under `storagefinder_shelves`
- Added `addShelf` method to context; shelves array is available globally
- Created `NewShelf.tsx` form page (`/space/:id/new-shelf`): Shelf Name (required) + Notes (optional), mirrors NewStorageSpace layout with Cancel/Save buttons
- Updated `StorageSpaceDetail` to filter shelves by `spaceId` and show them as `StorageRow` list with a shelf count label
- Empty state ("No shelves yet. Create your first shelf.") shown when no shelves exist
- "+ Add Shelf" button navigates to the new shelf form; shelf rows are tappable (ready for future items screen)

---

## [2026-04-26] Storage Space Detail Screen

- Created `StorageSpaceDetail` page (`/space/:id`) showing the space name and area in a sticky header with a back button
- Shows a "Shelves / Sections" section label and an empty state: "No shelves yet. Create your first shelf." with a Layers icon
- Full-width "Add Shelf" button is pinned at the bottom (ready for future shelf creation)
- Made every `StorageRow` on the Home screen clickable — tapping a space navigates to its detail screen
- Added `/space/:id` route to `App.tsx` and imported `StorageSpaceDetail`

---

## [2026-04-25] Create Storage Space Feature

- Added `NewStorageSpace` page (`/new-space`) with a clean form: Name (required), Area (optional), Notes (optional multi-line)
- Form includes Cancel (gray) and Save (teal) buttons fixed at the bottom
- Validation shows inline error if Name is empty
- Created `useStorageSpaces` hook that persists storage spaces in localStorage
- Updated Home screen to show the list of saved spaces using `StorageRow` (icon thumbnail, bold name, area, created date)
- When no spaces exist, the empty state + "Create storage space" button is shown
- When spaces exist, a count label and small "+ Add" button appear above the list
- Tapping "+ Create storage space" or "+ Add" navigates to the New Storage Space form

---

## [2026-04-25] Bottom Navigation Tab Renamed to "Home"

- Changed first bottom nav tab label from "My Items" to "Home" to fix text cutoff and give more space to other tabs
- Kept the teal Boxes (cubes) icon for the Home tab
- Active tab continues to highlight in teal via `text-primary` class

---

## [2026-04-25] Bottom Navigation Label + Active State

- Changed first bottom nav tab label from "My Stuff" to "My Items" (shorter, fits better in nav bar)
- Confirmed active tab ("My Items") highlights in teal; all other tabs remain gray
- Instruction added: PROJECT_HISTORY.md will now be updated automatically after every change

---

## [2026-04-25] Bottom Navigation Cleanup

- Changed first tab from "My Stored Items" to "My Items" for shorter, cleaner label
- Ensured active tab is properly highlighted in teal

---

## [2026-04-25] Initial Setup + Title Change

- Created basic app layout with React + Tailwind
- Added bottom navigation: My Stored Items, Search, Scan QR, Add Item, Profile
- Built empty state for My Stored Items screen with teal "Create storage space" button
- Changed main title from "My Stuff" to "My Stored Items"

---

## 2026-04-25 — Initial project setup

**Added**

- Project shell for StorageFinder built on the existing React + Vite + Tailwind
  webapp template.
- Light-mode design system in `src/index.css`: white background
  (`--background: 0 0% 100%`), dark text (`--foreground: 222 20% 12%`), and a
  teal primary/accent (`--primary: 174 72% 36%`). Replaced the old dark
  template palette so every shadcn component picks up the new theme.
- Switched the global font from `Syne` to `Inter` in `tailwind.config.ts` and
  `index.css` for a cleaner reading experience.
- New persistent **bottom navigation** (`src/components/BottomNav.tsx`) with the
  five tabs requested: **My Stuff**, **Search**, **Scan QR**, **Add Item**,
  **Profile**. Active tab is highlighted in teal.
- New `AppShell` (`src/components/AppShell.tsx`) wraps every page and renders
  the bottom nav via React Router's `<Outlet />` so the nav is always visible.
- Page scaffolds for each tab in `src/pages/`:
  - `MyStuff.tsx` shows the empty state **"No storage spaces yet. Create your
    first one."** with a teal **Create storage space** button.
  - `SearchPage.tsx`, `ScanQR.tsx`, `AddItem.tsx`, `Profile.tsx` are minimal
    placeholders that match the design system, ready to be filled in next.
- Shared **`StorageRow`** component (`src/components/StorageRow.tsx`)
  implementing the required row layout for every data list in the app:
  - 80×80 square photo on the left (rounded, falls back to a package icon).
  - Three lines on the right: bold description (top), full location path
    (middle), and a smaller date (bottom).
  - Fixed row height (`h-[104px]`) so every row is the same height and lists
    are fully scrollable.
- Routes wired up in `src/App.tsx` (`/`, `/search`, `/scan`, `/add`,
  `/profile`) under the shared `AppShell` layout. Removed the placeholder
  `Index.tsx` page.
- Updated `index.html` title, description, OG tags, and theme color to
  StorageFinder.

**Why**

This is the first checkpoint requested in the build plan: get the visual
foundation, navigation, and the standard list-row contract in place before any
real data is added. Centralizing the row layout in `StorageRow` now means every
future list (storage spaces, items, search results) automatically follows the
exact same layout — same photo size, same three lines, same height — without
having to re-decide it each time.

**Verification**

- `bunx tsc --noEmit` passes with zero errors.
- App renders the empty **My Stuff** screen with the bottom nav showing all
  five tabs. The other tabs render their placeholder screens.
