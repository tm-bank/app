import React, { type ReactNode } from "react";
import { Boxes, Grid3X3, LucideLayoutDashboard } from "lucide-react";
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
import { search } from "~/store/db";

import { Footer } from "./footer";
import { Header } from "./header";
import { SidebarTagsGroup } from "./tags-group";

interface Location {
  display: string;
  to: string;
  icon: ReactNode;
}

const LOCATIONS = [
  {
    display: "Scenery",
    to: "/",
    icon: <Grid3X3 />,
  },
  {
    display: "Dashboard",
    to: "/dashboard",
    icon: <LucideLayoutDashboard />,
  },
  {
    display: "Blocks",
    to: "/blocks",
    icon: <Boxes />,
  },
] as Location[];
export function TrackmaniaSidebar() {
  const routerLocation = useLocation();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [localItems, setLocalItems] = React.useState<any[]>([]);
  const { state } = useSidebar();
  const [isLoading, setIsLoading] = React.useState(true);

  // Determine what to load based on route
  const isBlocksRoute = routerLocation.pathname.startsWith("/blocks");

  React.useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        await search(searchQuery, dispatch, setLocalItems, isBlocksRoute);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [dispatch, isBlocksRoute]);

  React.useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        await search(searchQuery, dispatch, setLocalItems, isBlocksRoute);
      } catch (error) {
        console.error("Error searching:", error);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [searchQuery, dispatch, isBlocksRoute]);

  const tagCounts = React.useMemo(() => {
    if (isLoading) return {};
    return localItems.reduce<Record<string, number>>((acc, item) => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach((tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {});
  }, [localItems, isLoading]);

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
              {LOCATIONS.map((location) => (
                <SidebarMenuItem key={location.display}>
                  <Link to={location.to}>
                    <SidebarMenuButton
                      tooltip="Browse"
                      isActive={location.to === routerLocation.pathname}
                    >
                      {location.icon}
                      <span>{location.display}</span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {SidebarTagsGroup({
          state,
          isLoading,
          sortedTags,
          setSearchQuery,
          localMaps: localItems,
        })}
      </SidebarContent>
      <SidebarRail />
      <Footer />
    </Sidebar>
  );
}
