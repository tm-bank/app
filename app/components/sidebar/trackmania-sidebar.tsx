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
import { Badge } from "../ui/badge";

interface Location {
  display: string;
  to: string;
  icon: ReactNode;
  badge?: ReactNode;
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
    badge: <Badge className="bg-yellow-400">New</Badge>,
  },
] as Location[];
export function TrackmaniaSidebar() {
  const routerLocation = useLocation();
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [localMaps, setLocalMaps] = React.useState<any[]>([]);
  const [localBlocks, setLocalBlocks] = React.useState<any[]>([]);
  const { state } = useSidebar();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const [maps, blocks] = await Promise.all([
          search(searchQuery, dispatch, setLocalMaps, false),
          search(searchQuery, dispatch, setLocalBlocks, true),
        ]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  React.useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        await Promise.all([
          search(searchQuery, dispatch, setLocalMaps, false),
          search(searchQuery, dispatch, setLocalBlocks, true),
        ]);
      } catch (error) {
        console.error("Error searching:", error);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      isMounted = false;
    };
  }, [searchQuery, dispatch]);

  const sortedTags = React.useMemo(() => {
    const tags = [
      ...(localMaps?.flatMap((item) => item.tags || []) ?? []),
      ...(localBlocks?.flatMap((item) => item.tags || []) ?? []),
    ];
    return Array.from(new Set(tags)).sort();
  }, [localMaps, localBlocks]);

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
                      className="flex flex-row gap-2"
                    >
                      {location.icon}
                      <span>{location.display}</span>
                      <span className="flex grow" />
                      {location.badge}
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
          localMaps: [...localMaps, ...localBlocks],
        })}
      </SidebarContent>
      <SidebarRail />
      <Footer />
    </Sidebar>
  );
}
