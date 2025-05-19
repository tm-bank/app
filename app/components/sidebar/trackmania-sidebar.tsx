import * as React from "react";
import {
  Search,
  Grid3X3,
  Tag,
  UserX,
  LucideLayoutDashboard,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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

import { useAppDispatch } from "~/store/store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { useAuth } from "~/providers/auth-provider";

import { searchMaps } from "~/store/db";

function Header({
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

      <div className={`mt-4 relative ${state === "collapsed" ? "hidden" : ""}`}>
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
  );
}

export function Footer() {
  const { user, signInWithDiscord, signOut } = useAuth();

  return (
    <SidebarFooter className="bg-accent pb-4 pt-4">
      <SidebarMenu>
        {user ? (
          <>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={"Sign out"}
                size={"lg"}
                onClick={() => signOut()}
                className="cursor-pointer"
              >
                <UserX className="h-4 w-4" />
                Sign Out
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Separator className="mt-2 mb-2" />
              <SidebarMenuButton tooltip="Profile" size="lg">
                <Avatar className="h-8 w-8">
                  {user.avatar ? (
                    <AvatarImage
                      src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`}
                      alt={user.username || "User"}
                    />
                  ) : (
                    <AvatarFallback>
                      {user.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span>{user?.displayName || user?.username}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </>
        ) : (
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sign in with Discord"
              size="lg"
              onClick={() => signInWithDiscord()}
              className="bg-accent-foreground text-accent justify-center hover:bg-accent-foreground/90 hover:text-accent/90"
            >
              <span>Sign in</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarFooter>
  );
}

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
                        {localMaps.filter((m) => m.tags?.includes(tag)).length}
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
