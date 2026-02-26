"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderTree, Settings2 } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Organizer", icon: FolderTree },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b border-border/60 bg-card/60 px-3 py-3 lg:h-full lg:w-64 lg:border-r lg:border-b-0">
      <nav className="flex gap-2 lg:flex-col">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-primary text-primary-foreground" : "hover:bg-accent",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
