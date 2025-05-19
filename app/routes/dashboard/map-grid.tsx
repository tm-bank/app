import { Eye } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { useAppSelector } from "~/store/store";
import type { Map } from "~/types";
import { deleteMap } from "~/store/db";
import { useAuth } from "~/providers/auth-provider";
import { Link } from "react-router";
import { SceneryCard } from "~/components/scenery-grid";

export function MapGrid() {
  const maps = useAppSelector((state) => state.maps);
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your maps</h2>
        <p className="text-muted-foreground">Browse your Trackmania tracks</p>
      </div>
      {maps.maps.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No results found</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {maps.maps
          .filter((map) => map.authorId == user?.id)
          .map((item) => (
            <SceneryCard key={item.id} item={item} dashboard />
          ))}
      </div>
    </div>
  );
}