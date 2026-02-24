import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 shadow-soft border border-border grid place-items-center">
          <Sparkles className="h-4 w-4 text-foreground" />
        </div>
        <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 blur-xl opacity-40" />
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          VelvetGlow
        </div>
        <div className="text-xs text-muted-foreground">Beauty bookings, elegantly.</div>
      </div>
    </div>
  );
}
