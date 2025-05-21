"use client";

import {
  ArrowBigUp,
  ArrowUpRight,
  Flag,
  Map as IconMap,
  MoreVertical,
  Pencil,
  Trash,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useAppSelector } from "~/store/store";
import type { Map, User } from "~/types";
import { useAuth } from "~/providers/auth-provider";
import { Link } from "react-router";
import { toast } from "sonner";
import { sendDiscordWebhook } from "~/store/webhook";
import { castVote, deleteMap, getUser } from "~/store/db";
import { useEffect, useState } from "react";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent } from "./ui/dialog";
import { EditForm } from "~/routes/dashboard/edit-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

export function SceneryCard({
  item,
  dashboard,
}: {
  item: Map;
  dashboard?: boolean;
}) {
  if (!item) return <></>;

  const { user } = useAuth();
  const [author, setAuthor] = useState<User>();
  const [isVoting, setIsVoting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    async function fetchAuthor() {
      const author = await getUser(item.authorId);
      if (author) setAuthor(author);
    }
    fetchAuthor();
  }, []);

  return (
    <Card className="overflow-hidden" key={item.id}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <Link to={`/map/${item.id}`}>
              <h3 className="font-medium text-base">{item && item.title}</h3>
            </Link>
            {author && (
              <p className="text-sm text-muted-foreground">
                by {user?.id == author.id ? "you!" : author.displayName}
              </p>
            )}
          </div>

          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(dashboard || user?.admin) && (
                  <DropdownMenuItem onClick={() => setShowEdit(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {(dashboard || user?.admin) && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={async (e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (user?.id === item.authorId || user?.admin) {
                        const result = await deleteMap(item.id);
                        if (result) {
                          toast.error("Successfully deleted map.");
                        }
                      }
                    }}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
                {!dashboard && !user?.admin && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={async (e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      const reportURL = import.meta.env.VITE_REPORT_WEBHOOK;
                      const reporter = user?.username ?? "anonymous";
                      const message = `Report from ${reporter} of map: ${item.title} (${item.id})`;
                      const result = await sendDiscordWebhook(
                        reportURL,
                        message
                      );
                      if (!result) {
                        toast.error("Failed to report item");
                      } else {
                        toast.info("Successfully reported item");
                      }
                    }}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-3 flex-wrap grow">
          {item &&
            item.tags.map((category: string) => (
              <Badge variant="outline" className="px-2" key={category}>
                {category}
              </Badge>
            ))}
        </div>

        <div className="relative aspect-square overflow-hidden">
          <Link to={`/map/${item.id}`}>
            <img
              src={item.images[0] || "placeholder.svg"}
              className="object-cover w-full h-full transition-transform hover:scale-105"
              alt={item.title}
            />
          </Link>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex justify-between shrink">
        <div className="flex flex-row gap-2 items-center">
          {/* Upvote button */}
          {!dashboard && author && user?.id !== author.id && (
            <>
              <Tooltip>
                <TooltipContent>Upvote this item</TooltipContent>
                <TooltipTrigger>
                  <Button
                    variant={"outline"}
                    size={"sm"}
                    disabled={isVoting || !user}
                    onClick={async (e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      if (!user) {
                        toast.error("You must be signed in to vote.");
                        return;
                      }

                      if (user.id === item.authorId) {
                        toast.error("You cannot vote for your own map.");
                        return;
                      }

                      if (user.votes && user.votes.includes(item.id)) {
                        toast.info("You have already voted for this map.");
                        return;
                      }

                      setIsVoting(true);

                      const success = await castVote(user, item, true);

                      setIsVoting(false);

                      if (success) {
                        toast.success("Vote cast!");
                      }
                    }}
                  >
                    <ArrowBigUp
                      className={`h-4 w-4`}
                      fill={"var(color-foreground)"}
                      fillOpacity={
                        user?.votes && user?.votes.includes(item.id) ? 1 : 0
                      }
                    />
                  </Button>
                </TooltipTrigger>
              </Tooltip>
              <Separator orientation="vertical" />
            </>
          )}
          {/* View button */}
          <Button
            variant={"outline"}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (item.viewLink) {
                window.open(item.viewLink);
              }
            }}
          >
            <IconMap className="h-4 w-4" />
            View Map
          </Button>
        </div>

        <div className="flex items-center">
          <ArrowBigUp className="h-4 w-4 mr-1" />
          <span className="text-sm text-muted-foreground">
            {item.votes || 0}
          </span>
        </div>
      </CardFooter>

      {showEdit && (
        <Dialog open={showEdit} onOpenChange={setShowEdit}>
          <DialogContent className="min-w-80">
            <EditForm map={item} onSuccess={() => setShowEdit(false)} />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
