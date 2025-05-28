import { useAppSelector } from "~/store/store";
import { useAuth } from "~/providers/auth-provider";
import { toast } from "sonner";
import type { Block, User } from "~/types";
import { BlockCard } from "~/components/blocks-grid";

function filterMaps(maps: Block[], currentUser: User) {
  return maps.filter((map) => map && map.authorId === currentUser.id);
}

export function BlockGrid() {
  const blocks = useAppSelector((state) => state.blocks.blocks);
  const { user } = useAuth();

  if (!blocks) {
    toast.error("Failed to get blocks!");
  }



  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your blocks</h2>
        <p className="text-muted-foreground">Browse your Trackmania macroblocks</p>
      </div>
      {blocks && Array.isArray(blocks) && blocks.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No results found</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {blocks &&
          user &&
          Array.isArray(blocks) &&
          filterMaps(blocks, user).map((item) => (
            <BlockCard key={item.id} item={item} dashboard />
          ))}
      </div>
    </div>
  );
}
