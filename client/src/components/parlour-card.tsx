import * as React from "react";
import { Link } from "wouter";
import { MapPin, Star, ArrowUpRight, Phone } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function safeNum(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function ParlourCard({
  parlour,
  cityLabel,
}: {
  parlour: any;
  cityLabel?: string;
}) {
  const rating = safeNum(parlour?.rating, 0);
  const reviews = safeNum(parlour?.totalReviews, 0);

  return (
    <Card className="group bg-card/75 backdrop-blur-sm shadow-soft hover:shadow-luxe transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl leading-snug truncate">{parlour?.name ?? "Parlour"}</h3>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {cityLabel ?? "City"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {parlour?.phone ?? "—"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Badge variant="secondary" className="gap-1">
            <Star className="h-3.5 w-3.5" />
            {rating.toFixed(1)}
            <span className="text-muted-foreground ml-1">({reviews})</span>
          </Badge>
          <Link
            href={`/parlours/${parlour?.id}`}
            className={cn(
              "inline-flex items-center gap-2 text-sm font-semibold",
              "rounded-md border px-3 py-2 bg-gradient-to-r from-primary/10 to-accent/10",
              "hover:bg-card/80 transition-colors",
            )}
          >
            View <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-muted/40 to-card">
          <div className="absolute inset-0 opacity-60 noise-overlay" />
          <div className="relative p-4 md:p-5">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {parlour?.description ?? "No description yet."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(parlour?.services ?? []).slice(0, 3).map((s: any) => (
                <Badge key={s?.id ?? s?.name} variant="outline">
                  {s?.name ?? "Service"}
                </Badge>
              ))}
              {(parlour?.services?.length ?? 0) > 3 ? (
                <Badge variant="secondary">+{(parlour?.services?.length ?? 0) - 3} more</Badge>
              ) : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
