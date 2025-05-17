"use client";

import { ArrowUpRight, Download, Eye, Flag } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useAppSelector } from "~/store/store";
import type { Map } from "~/types";
import { bumpViews } from "~/store/db";
import { useAuth } from "~/providers/auth-provider";
import { Link } from "react-router";
import { toast } from "sonner";
import { sendDiscordWebhook } from "~/store/webhook";

export function SceneryGrid() {
  const maps = useAppSelector((state) => state.maps);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Scenery</h2>
        <p className="text-muted-foreground">
          Browse scenery items and palettes for your Trackmania tracks
        </p>
      </div>
      {maps.maps.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No results found</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {maps.maps.map((item) => (
          <SceneryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function SceneryCard({ item }: { item: Map }) {
  const { user } = useAuth();

  return (
    <Link to={`/map/${item.id}`}>
      <Card className="overflow-hidden" key={item.id}>
        <div className="relative aspect-[3/2] overflow-hidden">
          <img
            src={
              "https://wgztuhhevsawvztlqsfp.supabase.co/storage/v1/object/public/images//" +
                item.images[0] || "placeholder.svg"
            }
            alt={item.title}
            className="object-cover w-full h-full transition-transform hover:scale-105"
          />
        </div>

        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-base">{item.title}</h3>
              <p className="text-sm text-muted-foreground">
                by{" "}
                {user?.user_metadata.full_name == item.author_display
                  ? "you!"
                  : item.author_display !== null
                  ? item.author_display
                  : "unknown"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {item.tags.map((category: string) => (
              <Badge variant="outline" className="px-2" key={category}>
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between">
          <div className="flex items-center gap-2">
            <Eye className={`h-4 w-4`} />
            <span className="text-sm text-muted-foreground">{item.views}</span>
          </div>
          <div className="flex flex-row gap-2">
            <Tooltip>
              <TooltipContent>Report this item</TooltipContent>
              <TooltipTrigger>
                <Button
                  variant={"outline"}
                  size={"sm"}
                  onClick={async () => {
                    const reportURL = import.meta.env.VITE_REPORT_WEBHOOK;

                    const reporter =
                      user?.user_metadata.full_name ?? "anonymous";

                    const message = `Report from ${reporter} of map: ${item.title} (${item.id})`;

                    const result = await sendDiscordWebhook(reportURL, message);

                    if (!result) {
                      toast.error("Failed to report item");
                    } else {
                      toast.info("Successfully reported item");
                    }
                  }}
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
            </Tooltip>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                bumpViews(item.id);
                if (item.tmx_link) {
                  window.open(item.tmx_link);
                }
              }}
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>View</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
