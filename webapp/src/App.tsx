import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { FAB } from "@/components/FAB";
import { StorageSpacesProvider } from "@/context/StorageSpacesContext";
import MyStuff from "./pages/MyStuff";
import SearchPage from "./pages/SearchPage";
import ScanQR from "./pages/ScanQR";
import AddItem from "./pages/AddItem";
import Profile from "./pages/Profile";
import NewStorageSpace from "./pages/NewStorageSpace";
import StorageSpaceDetail from "./pages/StorageSpaceDetail";
import NewShelf from "./pages/NewShelf";
import ShelfDetail from "./pages/ShelfDetail";
import NewItem from "./pages/NewItem";
import AddItemChoice from "./pages/AddItemChoice";
import EditItem from "./pages/EditItem";
import EditStorageSpace from "./pages/EditStorageSpace";
import EditShelf from "./pages/EditShelf";
import RecentlyDeleted from "./pages/RecentlyDeleted";
import LocationDetail from "./pages/LocationDetail";
import LocationEdit from "./pages/LocationEdit";
import NewSubLocation from "./pages/NewSubLocation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StorageSpacesProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<MyStuff />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/scan" element={<ScanQR />} />
              <Route path="/add" element={<AddItem />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="/new-space" element={<NewStorageSpace />} />
            <Route path="/space/:id" element={<StorageSpaceDetail />} />
            <Route path="/space/:id/new-shelf" element={<NewShelf />} />
            <Route path="/space/:id/shelf/:shelfId" element={<ShelfDetail />} />
            <Route path="/space/:id/shelf/:shelfId/add-item-choice" element={<AddItemChoice />} />
            <Route path="/space/:id/shelf/:shelfId/new-item" element={<NewItem />} />
            <Route path="/space/:id/shelf/:shelfId/item/:itemId/edit" element={<EditItem />} />
            <Route path="/space/:id/edit" element={<EditStorageSpace />} />
            <Route path="/space/:id/shelf/:shelfId/edit" element={<EditShelf />} />
            <Route path="/recently-deleted" element={<RecentlyDeleted />} />
            <Route path="/location/:id" element={<LocationDetail />} />
            <Route path="/location/:id/edit" element={<LocationEdit />} />
            <Route path="/location/:parentId/new-location" element={<NewSubLocation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FAB />
        </BrowserRouter>
      </StorageSpacesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
