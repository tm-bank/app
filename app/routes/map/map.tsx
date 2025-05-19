import { useParams } from "react-router-dom";
import Wrapper from "~/wrapper";
import { SidebarInset } from "~/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useEffect, useState } from "react";
import { type User, type Map } from "~/types";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { getMap, getUser } from "~/store/db";

export function MapPage() {
  const { mapId } = useParams<{ mapId: string }>();
  const [map, setMap] = useState<Map>();
  const [author, setAuthor] = useState<User>();

  useEffect(() => {
    const fetchMap = async () => {
      const remoteMap = await getMap(mapId ?? "");

      if (!remoteMap) {
        toast.error("Failed to get map!");
      } else {
        setMap(remoteMap);
      }
    };

    const fetchAuthor = async () => {
      const author = await getUser(map?.authorId);

      if (!author) {
        toast.error("Failed to get author!");
      } else {
        setAuthor(author);
        fetchMap();
      }
    };

    fetchMap();
    fetchAuthor();
  }, []);

  return (
    <Wrapper>
      <SidebarInset className="p-4 md:p-6">
        {!map ? (
          <div className="flex h-full items-center justify-center">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-center text-muted-foreground">
                    Loading map data...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="w-full h-full">
              <CardHeader>
                <CardTitle>{map.title}</CardTitle>
                <CardDescription>
                  {author && author.displayName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 pb-2 flex-wrap">
                  {map.tags.map((category: string) => (
                    <Badge variant="outline" className="p-2" key={category}>
                      {category}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {map.images.map((url) => (
                    <img
                      src={url}
                      className="border border-border p-2 rounded-xl"
                      key={url}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => {
                    if (map.viewLink) {
                      window.open(map.viewLink);
                    }
                  }}
                >
                  View <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </SidebarInset>
    </Wrapper>
  );
}
