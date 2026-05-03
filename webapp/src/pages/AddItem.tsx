import { PlusSquare } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

const AddItem = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <PageHeader title="Add Item" subtitle="Add something to a space" />
      <div className="flex flex-1 items-center justify-center px-6 py-16 text-center">
        <div className="max-w-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <PlusSquare className="h-8 w-8" />
          </div>
          <p className="text-sm text-muted-foreground">
            Item creation coming next.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddItem;
