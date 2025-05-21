import { Tag } from "lucide-react";
import React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import { Badge } from "../ui/badge";

export function SidebarTagsGroup({ state, isLoading, sortedTags, setSearchQuery, localMaps }: { state: string; isLoading: boolean; sortedTags: string[]; setSearchQuery: React.Dispatch<React.SetStateAction<string>>; localMaps: any[]; }) {
  return <SidebarGroup className={cn(state === "collapsed" && "hidden")}>
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
                  {localMaps.filter(
                    (m) => m && Array.isArray(m.tags) && m.tags.includes(tag)
                  ).length}
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
  </SidebarGroup>;
}

