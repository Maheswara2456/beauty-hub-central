import * as React from "react";
import { cn } from "@/lib/utils";

export function NumberBadge({
  value,
  label,
  tone = "primary",
  className,
}: {
  value: React.ReactNode;
  label: string;
  tone?: "primary" | "accent" | "muted";
  className?: string;
}) {
  const toneClasses =
    tone === "primary"
      ? "from-primary/20 to-primary/5"
      : tone === "accent"
        ? "from-accent/22 to-accent/8"
        : "from-muted/70 to-muted/40";

  return (
    <div className={cn("rounded-xl border bg-card/70 shadow-soft p-4", className)}>
      <div className={cn("h-10 w-10 rounded-xl border bg-gradient-to-br grid place-items-center", toneClasses)}>
        <span className="text-sm font-bold">{value}</span>
      </div>
      <div className="mt-3">
        <div className="text-sm font-semibold">{label}</div>
      </div>
    </div>
  );
}
