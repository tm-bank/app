"use client";
import * as React from "react";
import { ThemeProvider } from "~/components/theme-provider";
import { SidebarProvider } from "~/components/ui/sidebar";
import { TooltipProvider } from "~/components/ui/tooltip";

import "./app.css";
import StoreProvider from "~/providers/store-provider";
import { AuthProvider } from "./providers/auth-provider";
import { Toaster } from "sonner";

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
      <AuthProvider>
        <ThemeProvider defaultTheme="system">
          <Toaster />
          <SidebarProvider>
            <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
          </SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </StoreProvider>
  );
}
