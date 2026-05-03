import { Outlet } from "react-router-dom";

export function AppShell() {
  return (
    <div className="flex min-h-full flex-col bg-background text-foreground">
      <main className="mx-auto w-full max-w-2xl flex-1 pb-[100px]">
        <Outlet />
      </main>
    </div>
  );
}
