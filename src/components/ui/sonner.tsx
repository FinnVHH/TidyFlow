"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  const { theme } = useTheme();
  const resolvedTheme: ToasterProps["theme"] =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system";

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:border-border group-[.toaster]:bg-card group-[.toaster]:text-card-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
