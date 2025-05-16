"use client";
import { TrackmaniaSidebar } from "./components/sidebar/trackmania-sidebar";
import { SidebarInset, SidebarTrigger } from "./components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./components/ui/breadcrumb";
import { ModeToggle } from "./components/mode-toggle";
import { useLocation } from "react-router";
import RootLayout from "./root-layout";
import React from "react";

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
                  <BreadcrumbLink href="/">home</BreadcrumbLink>
                </BreadcrumbItem>
                {location.pathname !== "/" &&
                  location.pathname
                    .split("/")
                    .filter(Boolean)
                    .map((segment, idx, arr) => {
                      const href = "/" + arr.slice(0, idx + 1).join("/");
                      return (
                        <React.Fragment key={href}>
                          <BreadcrumbSeparator />
                          <BreadcrumbItem>
                            <BreadcrumbLink href={href}>{segment}</BreadcrumbLink>
                          </BreadcrumbItem>
                        </React.Fragment>
                      );
                    })}
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
