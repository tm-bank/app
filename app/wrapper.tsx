"use client";
import { Upload } from "lucide-react";
import { TrackmaniaSidebar } from "./components/sidebar/trackmania-sidebar";
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

export default function Wrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
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
            <ModeToggle />
          </div>
        </header>
        {children}
      </SidebarInset>
    </RootLayout>
  );
}
