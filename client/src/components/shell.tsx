import * as React from "react";
import { cn } from "@/lib/utils";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-[calc(100vh-0px)] bg-mesh", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {children}
      </div>
    </div>
  );
}

export function SectionHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end md:justify-between gap-4", className)}>
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-balance">{title}</h1>
        {subtitle ? <p className="mt-2 text-muted-foreground leading-relaxed">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex items-center justify-start md:justify-end gap-2 flex-wrap">{right}</div> : null}
    </div>
  );
}
