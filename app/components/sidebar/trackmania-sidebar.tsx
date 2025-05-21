import React from "react";
import { Grid3X3, Tag, LucideLayoutDashboard } from "lucide-react";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "~/components/ui/sidebar";
import { Link, useLocation } from "react-router";

import { useAppDispatch } from "~/store/store";

import { searchMaps } from "~/store/db";
import { Footer } from "./footer";
import { Header } from "./header";

export function TrackmaniaSidebar() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [localMaps, setLocalMaps] = React.useState<any[]>([]);
  const { state } = useSidebar();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const fetchInitialMaps = async () => {
      setIsLoading(true);
      try {
        await searchMaps("", dispatch, (maps) => {
          if (isMounted) setLocalMaps(maps);
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInitialMaps();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  React.useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        await searchMaps(searchQuery, dispatch, (maps) => {
          if (isMounted) setLocalMaps(maps);
        });
      } catch (error) {
        console.error("Error searching maps:", error);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [searchQuery, dispatch]);

  const tagCounts = React.useMemo(() => {
    if (isLoading) return {};
    return localMaps.reduce<Record<string, number>>((acc, map) => {
      if (map.tags && Array.isArray(map.tags)) {
        map.tags.forEach((tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {});
  }, [localMaps, isLoading]);

  const sortedTags = React.useMemo(() => {
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag]) => tag)
      .slice(0, 6);
  }, [tagCounts]);

  return (
    <Sidebar collapsible="icon">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        state={state}
      />
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
                <Link to="/dashboard">
                  <SidebarMenuButton
                    tooltip="Dashboard"
                    isActive={location.pathname === "/dashboard"}
                  >
                    <LucideLayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className={cn(state === "collapsed" && "hidden")}>
          <SidebarGroupLabel>Tags</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <span>Loading tags...</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : sortedTags.length > 0 ? (
                sortedTags.map((tag) => (
                  <SidebarMenuItem key={tag}>
                    <SidebarMenuButton onClick={() => setSearchQuery(tag)}>
                      <Tag className="h-4 w-4" />
                      <span>{tag}</span>
                      <Badge variant="outline" className="ml-auto">
                        {
                          localMaps.filter(
                            (m) =>
                              m && Array.isArray(m.tags) && m.tags.includes(tag)
                          ).length
                        }
                      </Badge>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <span>No tags found</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <Footer />
    </Sidebar>
  );
}
