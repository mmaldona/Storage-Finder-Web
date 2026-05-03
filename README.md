# StorageFinder

Find anything you've stored, anywhere.

A clean, mobile-first React app for tracking storage spaces and the items
inside them.

## Stack

- **Frontend** (`webapp/`) — React 18, Vite, TypeScript, Tailwind, shadcn/ui,
  React Router v6, React Query.
- **Backend** (`backend/`) — Hono on Bun (not yet wired into the app).

## Project log

See [`PROJECT_HISTORY.md`](./PROJECT_HISTORY.md) for a dated entry of every
change made to the app.

## Layout contract

Every data list in the app uses the shared `StorageRow` component
(`webapp/src/components/StorageRow.tsx`):

- 80×80 photo on the left
- Bold description (top), full location path (middle), date (bottom, smaller)
- Fixed row height so the whole list scrolls cleanly

## Navigation

A persistent bottom nav with five tabs: **My Stuff**, **Search**, **Scan QR**,
**Add Item**, **Profile**.
