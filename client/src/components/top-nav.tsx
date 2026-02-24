import * as React from "react";
import { Link, useLocation } from "wouter";
import { MapPin, Ticket, LayoutDashboard, Moon, Sun, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand";
import { getOwnerSession, ownerLogout } from "@/hooks/use-owner";

function useTheme() {
  const [isDark, setIsDark] = React.useState(() => document.documentElement.classList.contains("dark"));
  React.useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.classList.contains("dark")));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("beauty.theme", next ? "dark" : "light");
  };
  return { isDark, toggle };
}

export function TopNav({ className }: { className?: string }) {
  const [location] = useLocation();
  const { isDark, toggle } = useTheme();
  const owner = getOwnerSession();

  const nav = [
    { href: "/", label: "Cities", icon: MapPin },
    { href: "/bookings", label: "My Bookings", icon: Ticket },
    { href: "/owner", label: "Owner", icon: LayoutDashboard },
  ];

  return (
    <div className={cn("sticky top-0 z-[999] border-b bg-background/70 backdrop-blur-xl", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-3">
          <Link href="/" className="group flex items-center gap-3">
            <BrandMark />
            <div className="hidden md:flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 shadow-soft">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Phase 1 MVP</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium border transition-colors",
                    active
                      ? "bg-secondary text-foreground border-secondary"
                      : "bg-transparent text-muted-foreground border-transparent hover:border-border hover:bg-card/60",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {owner ? (
              <div className="hidden sm:flex items-center gap-2 rounded-full border bg-card/70 px-3 py-1 shadow-soft">
                <div className="text-xs">
                  <div className="font-semibold leading-tight">{owner.parlourName}</div>
                  <div className="text-[11px] text-muted-foreground leading-tight">Owner session</div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => ownerLogout()}
                >
                  Logout
                </Button>
              </div>
            ) : null}

            <Button variant="outline" size="icon" onClick={toggle} aria-label="Toggle theme">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <div className="md:hidden">
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium border bg-card/60 hover:bg-card border-border"
              >
                Menu
              </Link>
            </div>
          </div>
        </div>

        <div className="md:hidden pb-3">
          <div className="grid grid-cols-3 gap-2">
            {nav.map((item) => {
              const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md border px-2 py-2 text-xs font-semibold transition-colors",
                    active ? "bg-secondary border-secondary" : "bg-card/50 hover:bg-card border-border",
                  )}
                >
                  <span className="flex items-center justify-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
