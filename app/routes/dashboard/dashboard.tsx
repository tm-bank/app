import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import Wrapper from "~/wrapper";
import { UploadForm } from "./upload-form";
import { MapGrid } from "./map-grid";

export function meta() {
  return [
    { title: "TM Bank | Dashboard" },
    { name: "description", content: "Welcome to the tm bank!" },
  ];
}

export default function Dash() {
  return (
    <Wrapper>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Maps Dashboard
            </h2>
          </div>
          <Tabs defaultValue="maps" className="space-y-4">
            <TabsList>
              <TabsTrigger value="maps">My Maps</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="maps" className="space-y-4">
              <MapGrid />
            </TabsContent>
            <TabsContent value="upload" className="space-y-4">
              <UploadForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Wrapper>
  );
}
