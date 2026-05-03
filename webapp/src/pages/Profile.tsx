import { useNavigate } from "react-router-dom";
import { User, Trash2, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useStorageSpaces } from "@/hooks/useStorageSpaces";

const Profile = () => {
  const navigate = useNavigate();
  const { recentlyDeleted } = useStorageSpaces();
  const deletedCount = recentlyDeleted.length;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <PageHeader title="Profile" subtitle="Your account" />

      <div className="flex flex-1 flex-col px-4 py-6">
        {/* Account placeholder */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-muted/40 px-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground">Sign in and settings coming next.</p>
        </div>

        {/* Recently Deleted */}
        <div className="rounded-2xl border border-border overflow-hidden">
          <button
            onClick={() => navigate("/recently-deleted")}
            className="flex w-full items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/50 active:bg-muted"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="font-medium text-foreground">Recently Deleted</p>
              <p className="text-sm text-muted-foreground">
                {deletedCount === 0
                  ? "Nothing deleted"
                  : `${deletedCount} item${deletedCount === 1 ? "" : "s"}`}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
