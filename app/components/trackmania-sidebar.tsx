"use client";

import * as React from "react";
import { Search, Grid3X3, Tag } from "lucide-react";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "~/components/ui/sidebar";
import { Link, useLocation } from "react-router";
import { Logo } from "./logo";
import { supabase } from "~/wrapper";

import { useAppDispatch } from "~/store/store";
import setReduxMaps from "~/store/maps-slice";

export function TrackmaniaSidebar() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [localMaps, setLocalMaps] = React.useState<any[]>([]);
  const { state } = useSidebar();
  const dispatch = useAppDispatch();
  const location = useLocation();

  async function fetchMaps(filter: string = "") {
    if (!supabase) return;

    let query = supabase
      .from("maps")
      .select(`id, created_at, author, title, images, tags, tmx_link, views`);

    if (filter) {
      query = query.or(
        `title.ilike.%${filter}%,author.ilike.%${filter}%,tags.cs.{${filter}}`
      );
    }

    query = query.order("views", { ascending: false });

    const { data, error } = await query.range(0, 50);

    if (error) {
      console.error("Supabase fetch error:", error);
      return;
    }

    const mapsArray = data || [];

    setLocalMaps(mapsArray);
    dispatch(setReduxMaps.actions.setMaps(mapsArray));
  }

  React.useEffect(() => {
    fetchMaps();
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => fetchMaps(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const tagCounts = React.useMemo(() => {
    return localMaps.reduce<Record<string, number>>((acc, map) => {
      map.tags.forEach((tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});
  }, [localMaps]);

  const sortedTags = React.useMemo(() => {
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag]) => tag);
  }, [tagCounts]);

  return (
    <Sidebar collapsible="icon">
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
          className={`mt-4 relative ${state === "collapsed" ? "hidden" : ""}`}
        >
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search"
            className="w-full pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to="/">
                  <SidebarMenuButton
                    tooltip="Browse"
                    isActive={location.pathname === "/"}
                  >
                    <Grid3X3 className="h-4 w-4" />
                    <span>Scenery</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className={cn(state === "collapsed" && "hidden")}>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sortedTags.map((tag) => (
                <SidebarMenuItem key={tag}>
                  <SidebarMenuButton onClick={() => setSearchQuery(tag)}>
                    <Tag className="h-4 w-4" />
                    <span>{tag}</span>
                    <Badge variant="outline" className="ml-auto">
                      {localMaps.filter((m) => m.tags.includes(tag)).length}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
