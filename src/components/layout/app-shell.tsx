"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Titlebar } from "@/components/layout/titlebar";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen min-w-[900px] bg-background text-foreground">
      <Titlebar />
      <div className="flex min-h-[calc(100vh-44px)] flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-hidden p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
