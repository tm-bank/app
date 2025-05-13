"use client";

import * as React from "react";
import {
  ArrowUpRight,
  Download,
  Eye,
  Flag,
  Heart,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export interface SceneryItem {
  id: number;
  title: string;
  categories: string[];
  author: string;
  views: number;
  imageUrl: string;
  new?: boolean;
}

const sceneryItems: SceneryItem[] = [
  {
    id: 1,
    title: "Hills & Valleys 2",
    categories: ["Nature", "Terrain", "Grass", "Tech", "Green", "Orange"],
    author: "longuint",
    views: 2453,
    imageUrl: "/example1.png?height=200&width=300",
  },
  {
    id: 1,
    title: "Crimson Carnation",
    categories: ["Dark", "Platform", "Tech", "Red", "Black"],
    author: "Colba",
    views: 2453,
    imageUrl: "/example2.png?height=200&width=300",
    new: true,
  },
  {
    id: 1,
    title: "Caught",
    categories: ["Dark", "Tech", "Yellow", "Black", "Orange"],
    author: "Cotton",
    views: 2453,
    imageUrl: "/example3.png?height=200&width=300",
  },
];

export function SceneryGrid() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Popular Scenery</h2>
        <p className="text-muted-foreground">
          Browse scenery items and palettes for your Trackmania tracks
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sceneryItems.map((item) => (
          <SceneryCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function SceneryCard({ item }: { item: SceneryItem }) {
  const [liked, setLiked] = React.useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[3/2] overflow-hidden">
        <img
          src={item.imageUrl || "/placeholder.svg"}
          alt={item.title}
          className="object-cover w-full h-full transition-transform hover:scale-105"
        />
        {item.new && (
          <Badge className="absolute top-2 right-2 bg-emerald-500">New</Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-base">{item.title}</h3>
            <p className="text-sm text-muted-foreground">by {item.author}</p>
          </div>
          <Tooltip>
            <TooltipContent>Report this item</TooltipContent>
            <TooltipTrigger>
              <Button variant={"ghost"} size="icon">
                <Flag className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
          </Tooltip>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {item.categories.map((category: String) => (
            <Badge variant="outline" className="px-2">
              {category}
            </Badge>
          ))}
        </div>
      </CardContent>
      <div className="flex grow" />
      <CardFooter className="pt-0 flex justify-between">
        <div className="flex items-center gap-2">
          <Download className={`h-4 w-4`} />
          <span className="text-sm text-muted-foreground">{item.views}</span>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <ArrowUpRight className="h-4 w-4" />
          <span>View</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
