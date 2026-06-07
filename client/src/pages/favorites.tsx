import * as React from "react";
import { Link, useLocation } from "wouter";
import { PageShell, SectionHeader } from "@/components/shell";
import { useFavorites, useToggleFavorite } from "@/hooks/use-favorites";
import { useCurrentUser } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Heart, MapPin, Star, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function FavoritesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: me, isLoading: meLoading } = useCurrentUser();
  const { data: favs, isLoading } = useFavorites();
  const toggle = useToggleFavorite();

  const handleRemove = async (parlourId: number) => {
    try {
      await toggle.mutateAsync(parlourId);
      toast({ title: "Removed from favourites" });
    } catch (e) {
      toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
    }
  };

  if (meLoading) {
    return (
      <PageShell>
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </PageShell>
    );
  }

  if (!me) {
    return (
      <PageShell>
        <SectionHeader title="My Favourites" subtitle="Save parlours you love." />
        <div className="mt-8">
          <EmptyState
            icon={LogIn}
            title="Sign in to view favourites"
            description="Create a free account to save and manage your favourite parlours."
            actionLabel="Sign in"
            onAction={() => setLocation("/login")}
          />
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SectionHeader
        title="My Favourites"
        subtitle="Parlours you've saved for quick access."
      />

      {isLoading ? (
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !favs || favs.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Heart}
            title="No favourites yet"
            description="Browse parlours and tap the heart icon to save them here."
            actionLabel="Browse parlours"
            onAction={() => setLocation("/")}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 animate-float-in">
          {(favs as any[]).map((fav) => {
            const p = fav.parlour;
            return (
              <Card key={fav.id} className="bg-card/75 shadow-soft border border-border">
                <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-14 w-14 rounded-xl border bg-gradient-to-br from-primary/12 to-accent/10 overflow-hidden flex-shrink-0">
                      {p?.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold truncate" data-testid={`text-parlour-name-${p?.id}`}>
                        {p?.name ?? "Parlour"}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <Star className="h-3 w-3" />
                          {Number(p?.rating ?? 0).toFixed(1)}
                        </Badge>
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {p?.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setLocation(`/parlours/${p?.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-500 hover:text-rose-600"
                      onClick={() => handleRemove(p?.id)}
                      disabled={toggle.isPending}
                      data-testid={`button-unfavorite-${p?.id}`}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
