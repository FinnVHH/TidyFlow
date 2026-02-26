"use client";

import { useTheme } from "next-themes";
import { MoonStar, Sun } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme !== "light";

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">
                Dark mode is default, light mode is available.
              </p>
            </div>
            <label className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
              <MoonStar className="h-4 w-4" />
            </label>
          </div>

          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium">Default Rule Preset</p>
            <p className="text-muted-foreground">
              Combined mode with Modified Date &gt; Type and duplicate strategy Rename.
            </p>
          </div>

          <div className="rounded-lg border p-4 text-sm">
            <p className="font-medium">App Version</p>
            <p className="text-muted-foreground">TidyFlow v0.1.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
