"use client";
import { Filter, Upload } from "lucide-react";
import { TrackmaniaSidebar } from "./components/trackmania-sidebar";
import { Button } from "./components/ui/button";
import { SidebarInset, SidebarTrigger } from "./components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "./components/ui/breadcrumb";
import { ModeToggle } from "./components/mode-toggle";
import { useLocation } from "react-router";
import RootLayout from "./root-layout";
import { useAppDispatch } from "./store/store";
import { useEffect } from "react";
import { fetchInitialResults } from "./store/thunk";

export default function Wrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchInitialResults());
  }, [dispatch]);

  return (
    <RootLayout>
      <TrackmaniaSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-2" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                {location.pathname !== "/" && (
                  <BreadcrumbItem>
                    <BreadcrumbLink href={location.pathname}>
                      {location.pathname.replace("/", "")}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
            <ModeToggle />
            <Button size="sm" className="gap-1">
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </Button>
          </div>
        </header>
        {children}
      </SidebarInset>
    </RootLayout>
  );
}
