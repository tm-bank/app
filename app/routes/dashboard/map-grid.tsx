import { useAppSelector } from "~/store/store";
import { useAuth } from "~/providers/auth-provider";
import { SceneryCard } from "~/components/scenery-grid";
import { toast } from "sonner";
import type { Map, User } from "~/types";

function filterMaps(maps: Map[], currentUser: User) {
  return maps.filter((map) => map && map.authorId === currentUser.id);
}

export function MapGrid() {
  const maps = useAppSelector((state) => state.maps);
  const { user } = useAuth();

  if (!maps) {
    toast.error("Failed to get maps!");
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your maps</h2>
        <p className="text-muted-foreground">Browse your Trackmania tracks</p>
      </div>
      {maps && Array.isArray(maps.maps) && maps.maps.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No results found</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {maps &&
          user &&
          Array.isArray(maps.maps) &&
          filterMaps(maps.maps, user).map((item) => (
            <SceneryCard key={item.id} item={item} dashboard />
          ))}
      </div>
    </div>
  );
}
