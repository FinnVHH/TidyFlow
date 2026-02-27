"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function StartupGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  if (!ready) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/branding/tidyflow-icon.png"
            alt="TidyFlow"
            width={72}
            height={72}
            className="animate-pulse"
            priority
          />
          <Image
            src="/branding/tidyflow-logo.png"
            alt="TidyFlow"
            width={220}
            height={72}
            className="opacity-90"
            priority
          />
          <div className="h-1.5 w-44 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
