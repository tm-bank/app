"use client";
import * as React from "react";
import { ThemeProvider } from "~/components/theme-provider";
import { SidebarProvider } from "~/components/ui/sidebar";
import { TooltipProvider } from "~/components/ui/tooltip";

import "./app.css";
import StoreProvider from "./store/store-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <StoreProvider>
      <ThemeProvider defaultTheme="system">
        <SidebarProvider>
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </StoreProvider>
  );
}
