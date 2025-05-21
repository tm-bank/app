import React, { type ReactNode } from "react";
import { Grid3X3, LucideLayoutDashboard } from "lucide-react";
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
] as Location[];

export function TrackmaniaSidebar() {
  const routerLocation = useLocation();
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
              {LOCATIONS.map((location) => (
                <SidebarMenuItem>
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
          localMaps,
        })}
      </SidebarContent>
      <SidebarRail />
      <Footer />
    </Sidebar>
  );
}
