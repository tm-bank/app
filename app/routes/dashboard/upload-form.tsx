"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ChevronDown, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "~/providers/auth-provider";
import { Separator } from "~/components/ui/separator";
import { useDispatch } from "react-redux";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { searchMaps, uploadMap } from "~/store/db";

const VALID_TAGS = {
  colors: [
    "Red",
    "Orange",
    "Yellow",
    "Green",
    "Blue",
    "Purple",
    "Black",
    "White",
  ],
  styles: ["Tech", "Wood", "Grass", "Dirt", "Plastic", "Wet", "Reactor"],
  themes: [
    "Dark",
    "Terrain",
    "Nature",
    "Minimalistic",
    "Nadeo",
    "Complex",
    "Abstract",
    "Towers",
    "MegaStructures",
    "Immersive",
    "Vanilla",
    "Vanila++",
    "Blender",
    "Water",
    "Rocks",
    "Sharp",
    "Curves",
    "Blocky",
    "Zoned",
  ],
  special_themes: [
    "Space",
    "Pirates",
    "Medieval",
    "Modern",
    "Sci-Fi",
    "City",
    "Farm",
    "Forest",
    "Hills",
  ],
  blocks: ["Platform", "Canopy"],
  base: ["Void", "NoStadium", "Stadium", "WaterBase"],
};

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  view_link: z.string().optional(),
  tags: z.array(z.string()).min(1, { message: "Select at least one tag." }),
  images: z
    .array(z.string().url())
    .min(1, { message: "Please provide at least one image URL." }),
});

export function UploadForm() {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const isSubmittingRef = useRef(false);

  type FormValues = z.infer<typeof formSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      view_link: "",
      tags: [],
      images: [],
    },
  });

  const handleAddImageUrl = () => {
    const url = prompt("Enter image URL:");
    if (url && /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(url)) {
      setImageUrls((prev) => [...prev, url]);
      form.setValue("images", [...form.getValues("images"), url]);
    } else if (url) {
      toast.error("Please enter a valid image URL (jpg, jpeg, png, webp).");
    }
  };

  const IMGUR_CLIENT_ID = import.meta.env.VITE_IMGUR; // Use your env variable

  const handleAddImgurAlbum = async () => {
    const albumUrl = prompt("Enter Imgur album URL:");
    if (!albumUrl) return;

    const match = albumUrl.match(/imgur\.com\/a\/([a-zA-Z0-9]+)/);
    if (!match) {
      toast.error("Invalid Imgur album URL.");
      return;
    }
    const albumHash = match[1];

    try {
      const res = await fetch(
        `https://api.imgur.com/3/album/${albumHash}/images`,
        {
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
        }
      );
      const data = await res.json();
      if (!data.success) {
        toast.error("Failed to fetch Imgur album.");
        return;
      }
      const urls = data.data.map((img: any) => img.link);
      setImageUrls((prev) => [...prev, ...urls]);
      form.setValue("images", [...form.getValues("images"), ...urls]);
      toast.success(`Added ${urls.length} images from Imgur album.`);
    } catch (e) {
      toast.error("Failed to fetch Imgur album.");
    }
  };

  const clearImageUrl = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
    const newImages = form
      .getValues("images")
      .filter((_: string, i: number) => i !== index);
    form.setValue("images", newImages);
  };

  const onTagToggle = (
    tag: string,
    selectedTags: string[],
    onChange: (tags: string[]) => void
  ) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((t) => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmittingRef.current) {
      toast.info("Upload already in progress, please wait");
      return;
    }

    isSubmittingRef.current = true;
    setIsUploading(true);

    try {
      if (!user) {
        toast.error("You must be signed in to upload maps.");
        return;
      }

      if (!values.images || values.images.length === 0) {
        toast.error("Please provide at least one image URL.");
        return;
      }

      let result = await uploadMap(values);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await searchMaps("", dispatch, () => {});

      toast.success("Map uploaded successfully!");
      form.reset();
      setImageUrls([]);
    } catch (error) {
      toast.error(`Error uploading map: ${error}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 1000);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Map Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter map title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="view_link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        View Link <Separator orientation="vertical" />
                        <span className=" text-muted-foreground">
                          trackmania.io, mania.exchange, ...
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter map link"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tags <Separator orientation="vertical" />
                        <span className=" text-muted-foreground">
                          suggest more tags by opening an issue on the{" "}
                          <a
                            className="underline"
                            href="https://github.com/tm-bank/app"
                          >
                            github
                          </a>
                        </span>
                      </FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(VALID_TAGS).map(
                          ([category, tagList]) => (
                            <div key={category} className="mb-2 mr-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="capitalize flex justify-between min-w-[120px]"
                                  >
                                    {category.replace("_", " ")}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
                                  {tagList.map((tag) => (
                                    <DropdownMenuCheckboxItem
                                      key={tag}
                                      checked={field.value.includes(tag)}
                                      onCheckedChange={() =>
                                        onTagToggle(
                                          tag,
                                          field.value,
                                          field.onChange
                                        )
                                      }
                                      onSelect={(e) => {
                                        e.preventDefault();
                                      }}
                                    >
                                      {tag}
                                    </DropdownMenuCheckboxItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">Images</div>
                    <br />
                    <span className="text-muted-foreground">
                      The first image will show as the banner.
                    </span>
                  </div>
                  <div className="mt-1.5">
                    {imageUrls.length > 0 ? (
                      <div className="flex flex-wrap gap-4">
                        {imageUrls.map((url, idx) => (
                          <div
                            key={url}
                            className="relative w-32 h-32 rounded-lg overflow-visible"
                          >
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 z-10 h-6 w-6"
                              onClick={() => clearImageUrl(idx)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <img
                              src={url || "/placeholder.svg"}
                              className="max-w-full max-h-full rounded"
                            />
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          className="w-32 h-32 flex flex-col items-center justify-center"
                          onClick={handleAddImageUrl}
                        >
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <span>Add URL</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-32 h-32 flex flex-col items-center justify-center"
                          onClick={handleAddImgurAlbum}
                        >
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <span>Add Imgur Album</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-32 flex flex-col items-center justify-center"
                          onClick={handleAddImageUrl}
                        >
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <span>
                            <span className="font-semibold">
                              Click to add image URL
                            </span>
                          </span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-32 flex flex-col items-center justify-center"
                          onClick={handleAddImgurAlbum}
                        >
                          <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                          <span>
                            <span className="font-semibold">
                              Add Imgur Album
                            </span>
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={imageUrls.length === 0 || isUploading}
            >
              {isUploading ? "Uploading..." : "Upload Map"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
