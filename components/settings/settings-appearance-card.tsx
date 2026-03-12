import { Palette } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Card } from "@/components/ui/card";

export function SettingsAppearanceCard() {
  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Palette className="size-4 text-primary" />
        Appearance
      </div>

      <p className="text-sm text-muted-foreground">
        Pick the app theme and accent color used across dashboard pages.
      </p>

      <div>
        <ThemeSwitcher />
      </div>
    </Card>
  );
}