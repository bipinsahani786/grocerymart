import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/store/themeStore";
import { Button } from "./button";

export function ModeToggle() {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme === "dark" || theme === "semi-dark";

  const handleToggle = () => {
    const nextTheme = isDark ? "light" : "dark";

    // Fallback if View Transitions API is not supported
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    document.startViewTransition(() => {
      setTheme(nextTheme);
    });
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      className="relative h-10 w-10 border border-border bg-input-bg text-foreground hover:bg-muted cursor-pointer shrink-0"
      title="Toggle theme"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] text-yellow-500 dark:text-yellow-400 transition-all duration-300 animate-[spin_20s_linear_infinite] ${
        isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
      }`} />
      <Moon className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
        isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
      }`} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
