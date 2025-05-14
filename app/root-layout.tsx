"use client";
import * as React from "react";
import { ThemeProvider } from "~/components/theme-provider";
import { SidebarProvider } from "~/components/ui/sidebar";
import store from "./store/store";
import { Provider } from "react-redux";
import { TooltipProvider } from "~/components/ui/tooltip";

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
    <Provider store={store}>
      <ThemeProvider defaultTheme="system">
        <SidebarProvider>
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </Provider>
  );
}
