import { useEffect, useState } from "react";
import { useAuth } from "~/providers/auth-provider";
import { castVoteBlock, deleteBlock, getUser } from "~/store/db";
import { useAppSelector, useAppDispatch } from "~/store/store";
import type { Block, User } from "~/types";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Link } from "react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Dialog, DialogContent } from "./ui/dialog";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  MoreVertical,
  Trash,
  Flag,
  ArrowBigUp,
  Download,
  Pencil,
  LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { EditForm } from "~/routes/dashboard/edit-form";
import { sendDiscordWebhook } from "~/store/webhook";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { search } from "~/store/db";

export function BlocksGrid() {
  const blocks = useAppSelector((state) => state.blocks);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Blocks</h2>
        <p className="text-muted-foreground">
          Browse scenery items and download them for your Trackmania tracks.
        </p>
      </div>
      {blocks.blocks.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No results found</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {blocks.blocks.map((item) => (
          <BlockCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function BlockCard({
  item,
  dashboard,
}: {
  item: Block;
  dashboard?: boolean;
}) {
  if (!item) return <></>;

  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const [author, setAuthor] = useState<User>();
  const [isVoting, setIsVoting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    async function fetchAuthor() {
      const author = await getUser(item.authorId);
      if (author) setAuthor(author);
    }
    fetchAuthor();
  }, [item.authorId]);

  const refreshBlocks = async () => {
    await search("", dispatch, () => {}, true);
  };

  return (
    <Card className="overflow-hidden" key={item.id}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-medium text-base">{item && item.title}</h3>
            {author && (
              <p className="text-sm text-muted-foreground">
                by{" "}
                {(user?.id == author.id ? "you!" : author.displayName) ??
                  "unknown"}
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
                {(user?.admin || user?.id === item.authorId) && (
                  <>
                    <DropdownMenuItem onClick={() => setShowEdit(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={async (e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (user?.id === item.authorId || user?.admin) {
                          const result = await deleteBlock(item.id);
                          if (result) {
                            toast.success("Successfully deleted block.");
                            await refreshBlocks();
                          }
                        }
                      }}
                    >
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
                {!dashboard && !user?.admin && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={async (e) => {
                      e.stopPropagation();
                      e.preventDefault();

                      const reportURL = import.meta.env.VITE_REPORT_WEBHOOK;
                      const reporter = user?.username ?? "anonymous";
                      const message = `Report from ${reporter} of block: ${item.title} (${item.id})`;
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
                <DropdownMenuItem
                  onClick={async (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (navigator.clipboard) {
                      await navigator.clipboard.writeText(item.id);
                      toast.success("Item ID copied to clipboard");
                    } else {
                      toast.error("Failed to copy item ID");
                    }
                  }}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Copy id
                </DropdownMenuItem>
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

        <div className="relative aspect-square overflow-hidden items-center justify-center flex">
          <img
            src={item.image || "placeholder.svg"}
            className="object-cover w-full h-full transition-transform border rounded-xl hover:scale-105"
            alt={item.title}
          />
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
                        toast.error("You cannot vote for your own block.");
                        return;
                      }

                      if (user.votes && user.votes.includes(item.id)) {
                        toast.info("You have already voted for this block.");
                        return;
                      }

                      setIsVoting(true);

                      const success = await castVoteBlock(user, item, true);

                      setIsVoting(false);

                      if (success) {
                        toast.success("Vote cast!");
                        await refreshBlocks();
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
          {/* Download button */}
          <Button
            variant={"outline"}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (item.bucketFileName) {
                window.open(
                  `${
                    import.meta.env.VITE_API_URL
                  }/blocks/download/${encodeURIComponent(
                    item.bucketFileName.replace(/^blocks\//, "")
                  )}`
                );
              }
            }}
          >
            <Download className="h-4 w-4" />
            Download
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
          <DialogContent className=" max-w-full min-w-80 sm:max-w-fit">
            <EditForm
              map={item}
              onSuccess={async () => {
                setShowEdit(false);
                await refreshBlocks();
              }}
              isBlock
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
