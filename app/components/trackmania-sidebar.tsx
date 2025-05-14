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
import { useAppSelector } from "~/store/store";

export function TrackmaniaSidebar() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { state } = useSidebar();

  const location = useLocation();

  React.useEffect(() => {
    console.log("Search query changed:", searchQuery);
  }, [searchQuery]);

  const categories = useAppSelector((state) => state.category.categories);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Logo fill="var(--primary-foreground)" />
          </div>
          <div
            className={`font-semibold text-lg leading-none ${
              state == "collapsed" ? "hidden" : ""
            }`}
          >
            Scenery Bank
          </div>
        </div>
        <div
          className={`mt-4 relative ${state == "collapsed" ? "hidden" : ""}`}
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
              {categories.map((category) => (
                <SidebarMenuItem key={category[0]}>
                  <SidebarMenuButton>
                    <Tag className="h-4 w-4" />
                    <span>{category[0]}</span>
                    <Badge variant="outline" className="ml-auto">
                      {category[1]}
                    </Badge>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className={cn(state === "collapsed" && "hidden")}>
          <SidebarGroupLabel>Quick Filters</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex flex-wrap gap-2 px-2 py-1">
              <Badge variant="secondary" className="cursor-pointer">
                Most Popular
              </Badge>
              <Badge variant="secondary" className="cursor-pointer">
                Newest
              </Badge>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
