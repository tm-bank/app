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
import { findAuthorFromMap, getMap } from "~/store/db";

export function MapPage() {
  const { mapId } = useParams<{ mapId: string }>();
  const [map, setMap] = useState<Map>();
  const [author, setAuthor] = useState<User>();
  const [openImage, setOpenImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchMap = async () => {
      const remoteMap = await getMap(mapId ?? "");

      if (!remoteMap) {
        toast.error("Failed to get map!");
      } else {
        setMap(remoteMap);
      }
    };

    fetchMap();
  }, []);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!map) {
        console.log("map does not exist, ignoring fetchAuthor");
        return;
      }
      const author = await findAuthorFromMap(map!);

      if (!author) {
        toast.error("Failed to get author!");
      } else {
        setAuthor(author);
      }
    };

    fetchAuthor();
  }, [map]);

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
                      className="border border-border p-2 rounded-xl cursor-pointer"
                      key={url}
                      onClick={() => setOpenImage(url)}
                      alt="Map"
                    />
                  ))}
                </div>
                {openImage && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
                    onClick={() => setOpenImage(null)}
                  >
                    <img
                      src={openImage}
                      alt="Large"
                      className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                {map.blocks.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold">Blocks:</h3>
                    <div className="flex flex-row items-center gap-2 mb-2 flex-wrap">
                      {map.blocks.map((block) => (
                        <Card key={block.id}>
                          <CardHeader>
                            <CardTitle>{block.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <img
                              src={block.image ?? "placeholder.svg"}
                              alt={block.title}
                              className="w-full h-32 object-cover rounded-lg mb-2 hover:scale-105 cursor-pointer"
                              onClick={() => {
                                window.open(
                                  `${
                                    import.meta.env.VITE_API_URL
                                  }/blocks/download/${encodeURIComponent(
                                    block.bucketFileName.replace(/^blocks\//, "")
                                  )}`
                                );
                              }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
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
