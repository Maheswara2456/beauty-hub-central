import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("glass noise-overlay rounded-xl p-8 md:p-10 text-center animate-float-in", className)}>
      <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/16 via-primary/8 to-accent/14 border border-border shadow-soft grid place-items-center">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-xl md:text-2xl">{title}</h3>
      {description ? <p className="mt-2 text-muted-foreground leading-relaxed max-w-md mx-auto">{description}</p> : null}
      {actionLabel && onAction ? (
        <div className="mt-6 flex justify-center">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}
