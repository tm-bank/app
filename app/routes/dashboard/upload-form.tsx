"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import type { Map } from "~/types";
import { useAuth } from "~/providers/auth-provider";
import { uploadImage, uploadMap, fetchMaps } from "~/store/db";
import { Separator } from "~/components/ui/separator";
import { useDispatch } from "react-redux";

const VALID_TAGS = [
  /* Colors */
  "Red",
  "Orange",
  "Yellow",
  "Green",
  "Blue",
  "Purple",
  "Black",
  "White",
  /* Styles */
  "Tech",
  "Wood",
  "Grass",
  "Dirt",
  "Plastic",
  "Wet",
  "Reactor",
  /* Themes */
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
  /* Blocks */
  "Platform",
  "Canopy",
  /* Misc */
  "Void",
  "NoStadium",
  "Stadium",
  "WaterBase"
];

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  view_link: z.string().optional(),
  tags: z.array(z.string()).min(1, { message: "Select at least one tag." }),
  images: z
    .array(z.instanceof(File))
    .min(1, { message: "Please upload at least one image." }),
});

export function UploadForm() {
  const [previewImages, setPreviewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const dispatch = useDispatch();

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setPreviewImages((prev) => [...prev, ...files]);
      setPreviewUrls((prev) => [
        ...prev,
        ...files.map((file) => URL.createObjectURL(file)),
      ]);
      form.setValue("images", [...form.getValues("images"), ...files]);
    }
  };

  const clearPreviewImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    const newImages = form
      .getValues("images")
      .filter((_: File, i: number) => i !== index);
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
    if (!(user?.aud === "authenticated")) {
      toast.error("You must be signed in to upload maps.");
      console.log("Not authenticated");
      return;
    }

    if (values.view_link === undefined) {
      console.log("Missing map image or view link!");
      return;
    }

    // Upload all images and collect their links
    const links: string[] = [];
    for (const image of values.images) {
      const link = await uploadImage(image);
      if (link) {
        links.push(link);
      }
    }

    if (links.length === 0) {
      return;
    }

    const map: Omit<Map, "id"> = {
      author: user.id,
      author_display: user.user_metadata.custom_claims.global_name,
      created_at: new Date(Date.now()),
      tags: values.tags,
      tmx_link: values.view_link,
      views: 0,
      title: values.title,
      images: links,
    };

    let result = await uploadMap(map);
    setIsUploading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await fetchMaps("", dispatch, () => {});
      form.reset();

      // Clear all previews
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
      setPreviewImages([]);
      setPreviewUrls([]);
    } catch (error) {
      toast.error(`Error uploading map: ${error}`);
    } finally {
      setIsUploading(false);
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
                            href="https://github.com/languint/tm-bank"
                          >
                            github
                          </a>
                        </span>
                      </FormLabel>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {VALID_TAGS.map((tag) => (
                          <Button
                            key={tag}
                            type="button"
                            variant={
                              field.value.includes(tag) ? "default" : "outline"
                            }
                            className="px-3 py-1 text-xs"
                            onClick={() =>
                              onTagToggle(tag, field.value, field.onChange)
                            }
                            aria-pressed={field.value.includes(tag)}
                          >
                            {tag.charAt(0).toUpperCase() + tag.slice(1)}
                          </Button>
                        ))}
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
                    {previewUrls.length > 0 ? (
                      <div className="flex flex-wrap gap-4">
                        {previewUrls.map((url, idx) => (
                          <div
                            key={url}
                            className="relative w-32 h-32 rounded-lg overflow-visible"
                          >
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 z-10 h-6 w-6"
                              onClick={() => clearPreviewImage(idx)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <img
                              src={url || "/placeholder.svg"}
                              className="max-w-full max-h-full rounded"
                            />
                          </div>
                        ))}
                        <label
                          htmlFor="preview-image"
                          className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted/60"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-xs text-muted-foreground">
                              Add more
                            </p>
                          </div>
                          <Input
                            id="preview-image"
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            multiple
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="preview-image"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/40 hover:bg-muted/60"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG or WEBP (MAX. 5MB)
                            </p>
                          </div>
                          <Input
                            id="preview-image"
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            multiple
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto"
              disabled={previewImages.length === 0}
            >
              {isUploading ? "Uploading..." : "Upload Map"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
