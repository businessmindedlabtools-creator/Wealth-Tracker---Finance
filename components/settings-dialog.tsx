"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const COMPACT_MODE_KEY = "wealth-tracker:compact-mode";

export function SettingsDialog() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads persisted preference and avoids SSR/client mismatch, mirrors theme-toggle pattern
    setCompactMode(window.localStorage.getItem(COMPACT_MODE_KEY) === "true");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute(
      "data-density",
      compactMode ? "compact" : "comfortable",
    );
    window.localStorage.setItem(COMPACT_MODE_KEY, String(compactMode));
  }, [compactMode, mounted]);

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="ghost" size="icon" className="size-8" />}
      >
        <SettingsIcon className="size-4" />
        <span className="sr-only">Settings</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preferences</DialogTitle>
          <DialogDescription>
            Customize how Wealth Tracker looks on this device.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="theme-select">Theme</Label>
            <Select
              value={mounted ? (theme ?? "system") : "system"}
              onValueChange={(value) => setTheme(value as string)}
            >
              <SelectTrigger id="theme-select" size="sm" className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="compact-mode-toggle">Compact tables</Label>
            <Button
              id="compact-mode-toggle"
              variant="outline"
              size="sm"
              aria-pressed={compactMode}
              onClick={() => setCompactMode((value) => !value)}
            >
              {compactMode ? "On" : "Off"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
