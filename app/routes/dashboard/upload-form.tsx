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
import { uploadImage, uploadMap } from "~/store/db";
import { v4 } from "uuid";
import { Separator } from "~/components/ui/separator";

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
  /* Themes */
  "Dark",
  "Terrain",
  "Nature",
  /* Blocks */
  "Platform",
  "Canopy",
];

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  view_link: z.string().optional(),
  tags: z.array(z.string()).min(1, { message: "Select at least one tag." }),
  image: z.instanceof(File),
});

export function UploadForm() {
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  type FormValues = z.infer<typeof formSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      view_link: "",
      tags: [],
      image: previewImage as File,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      form.setValue("image", file); // <-- This line is required!
    }
  };

  const clearPreviewImage = () => {
    setPreviewImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
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

    const link = await uploadImage(v4(), values.image);

    if (!link) {
      return;
    }

    const map: Omit<Map, "id"> = {
      author: user.id,
      author_display: user.user_metadata.full_name,
      created_at: new Date(Date.now()),
      tags: values.tags,
      tmx_link: values.view_link,
      views: 0,
      title: values.title,
      images: [link],
    };

    let result = uploadMap(map);

    setIsUploading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      form.reset();

      clearPreviewImage();
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
                          suggest more tags on the{" "}
                          <a
                            className="underline"
                            href="https://github.com/tm-bank/app"
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
                  <Label htmlFor="preview-image">
                    Image
                    <Separator orientation="vertical" />
                    <span className=" text-muted-foreground">
                      ideally 100% aspect ratio
                    </span>
                  </Label>
                  <div className="mt-1.5">
                    {previewUrl ? (
                      <div className="relative w-full h-48 rounded-lg overflow-visible">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 z-10 h-8 w-8"
                          onClick={clearPreviewImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          className="max-w-full max-h-full"
                        />
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
              disabled={!previewUrl || !previewImage}
            >
              {isUploading ? "Uploading..." : "Upload Map"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
