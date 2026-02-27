import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FolderTree, ShieldCheck, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const HIGHLIGHTS = [
  {
    icon: FolderTree,
    title: "Smart Organization Rules",
    description: "Combine file type, date hierarchy, and custom extension mapping.",
  },
  {
    icon: Sparkles,
    title: "Dry Run Preview",
    description: "Inspect every planned move before changing any file on disk.",
  },
  {
    icon: ShieldCheck,
    title: "Safe Rollback",
    description: "Every move is logged so the last operation can be undone in one click.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-6">
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-card to-muted/40">
        <CardContent className="grid items-center gap-6 p-8 md:grid-cols-[1fr_auto]">
          <div className="space-y-4">
            <Image
              src="/branding/tidyflow-logo.png"
              alt="TidyFlow"
              width={260}
              height={84}
              priority
            />
            <p className="max-w-2xl text-sm text-muted-foreground">
              Organize cluttered folders with predictable rules, preview every move, and
              rollback instantly if needed.
            </p>
            <Button asChild size="lg">
              <Link href="/organizer">
                Open Organizer
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <Image
            src="/branding/tidyflow-icon.png"
            alt="TidyFlow icon"
            width={124}
            height={124}
            className="rounded-2xl border border-border/50 bg-background/80 p-4"
            priority
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {HIGHLIGHTS.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Icon className="h-4 w-4 text-primary" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
