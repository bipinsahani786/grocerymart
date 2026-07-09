import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { Button } from "./button";

export function ModeToggle() {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === "dark" || theme === "semi-dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative h-10 w-10 border border-border bg-input-bg text-foreground hover:bg-muted cursor-pointer shrink-0"
      title="Toggle theme"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
        isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
      }`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
        isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
      }`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
