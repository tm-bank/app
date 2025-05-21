import { Search, TextSearch } from "lucide-react";
import { SidebarHeader } from "../ui/sidebar";
import { Logo } from "./logo";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";

export function Header({
  setSearchQuery,
  searchQuery,
  state,
}: {
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  searchQuery: string;
  state: "expanded" | "collapsed";
}) {
  return (
    <SidebarHeader className="p-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Logo fill="var(--primary-foreground)" />
        </div>
        <div
          className={`font-semibold text-lg leading-none ${
            state === "collapsed" ? "hidden" : ""
          }`}
        >
          TM Bank
        </div>
      </div>

      <div
        className={`mt-4 relative ${
          state === "collapsed" ? "hidden" : ""
        } flex gap-2`}
      >
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search"
          className="grow pl-9 h-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Dialog>
          <DialogTrigger>
            <Button variant={"secondary"}>
              <TextSearch className="w-9 h-9" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Search tips</DialogTitle>
            <DialogDescription>
              You can more finely search for items by using commas and
              selectors. <br />
              Selectors are text followed by a colon <b>:</b>, and then the
              parameter. <br />
              There are currently 2 selectors; author, and title. <br />
              Let's say I want all the maps from John that have the title "Map"
              in them, and that are red. Our query would look like:
              <div className="rounded-xl border mt-2 p-2 flex gap-2 items-center">
                <Search className="w-4" />
                <label>author:John, title:Map, Red</label>
              </div>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarHeader>
  );
}
