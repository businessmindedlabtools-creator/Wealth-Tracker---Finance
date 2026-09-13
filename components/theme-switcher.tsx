"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon, MonitorIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const cycle = ["light", "dark", "system"] as const;

const icons = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- avoids SSR/client theme mismatch, per next-themes docs
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="ghost" size="icon" className="size-8" disabled />;
  }

  const current = (theme as (typeof cycle)[number]) ?? "system";
  const Icon = icons[current];

  const handleClick = () => {
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    setTheme(next);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={handleClick}
      title={`Theme: ${current} (click to change)`}
    >
      <Icon className="size-4" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
