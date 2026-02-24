import * as React from "react";
import { useParams, Link, useLocation } from "wouter";
import { PageShell, SectionHeader } from "@/components/shell";
import { useParlour } from "@/hooks/use-parlours";
import { useGallery } from "@/hooks/use-gallery";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Star, CalendarDays, Users, Images, ArrowLeft, Phone, Mail } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

function ratingNumber(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function ParlourDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [, setLocation] = useLocation();

  const { data, isLoading, error, refetch } = useParlour(id);
  const parlour = data as any;

  const { data: gallery } = useGallery(Number(parlour?.id ?? id));

  const cover = (parlour?.imageUrl as string | null | undefined) || "";

  return (
    <PageShell>
      <SectionHeader
        title={parlour?.name ?? "Parlour"}
        subtitle={parlour?.description ?? "Discover services, choose an artist, and book your slot."}
        right={
          <>
            <Link
              href={parlour?.city?.id ? `/cities/${parlour.city.id}/parlours` : "/"}
              className="inline-flex items-center gap-2 text-sm font-semibold rounded-md border px-3 py-2 bg-card/60 hover:bg-card"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Button
              onClick={() => setLocation(`/book/parlour/${id}`)}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Book now
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <Skeleton className="h-56 rounded-xl" />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-40 rounded-xl" />
            </div>
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-60 rounded-xl" />
          </div>
        </div>
      ) : error ? (
        <div className="mt-6">
          <EmptyState
            icon={MapPin}
            title="Couldn’t load parlour"
            description={(error as Error).message}
            actionLabel="Try again"
            onAction={() => refetch()}
          />
        </div>
      ) : !parlour ? (
        <div className="mt-6">
          <EmptyState icon={MapPin} title="Not found" description="This parlour doesn’t exist." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-float-in">
          <div className="lg:col-span-8 space-y-6">
            <Card className="glass noise-overlay overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  {cover ? (
                    <>
                      {/* parlour cover image */}
                      <img
                        src={cover}
                        alt={`${parlour.name} cover`}
                        className="h-56 md:h-72 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                    </>
                  ) : (
                    <div className="h-56 md:h-72 w-full bg-gradient-to-br from-primary/18 via-card to-accent/14" />
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3.5 w-3.5" />
                        {ratingNumber(parlour.rating).toFixed(1)}
                        <span className="text-muted-foreground ml-1">({parlour.totalReviews ?? 0})</span>
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {parlour.city?.name ?? "City"}
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {(parlour.staff?.length ?? 0)} artists
                      </Badge>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {parlour.address}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass noise-overlay p-5 md:p-6">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-xl md:text-2xl">Services</h2>
                  <p className="text-sm text-muted-foreground">Pick a service to start booking.</p>
                </div>
                <Button variant="secondary" onClick={() => setLocation(`/book/parlour/${id}`)}>
                  Start booking
                </Button>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(parlour.services ?? []).map((s: any) => (
                  <div key={s.id} className="rounded-xl border bg-card/60 p-4 shadow-soft">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{s.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {s.category} • {s.duration} mins
                        </div>
                      </div>
                      <div className="text-sm font-bold tabular-nums">₹{Number(s.price ?? 0).toFixed(0)}</div>
                    </div>
                    {s.description ? (
                      <div className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{s.description}</div>
                    ) : null}
                  </div>
                ))}
                {(parlour.services?.length ?? 0) === 0 ? (
                  <div className="sm:col-span-2">
                    <EmptyState
                      icon={CalendarDays}
                      title="No services published yet"
                      description="Owners can add services from the Owner Dashboard."
                      actionLabel="Owner dashboard"
                      onAction={() => setLocation("/owner")}
                    />
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="glass noise-overlay p-5 md:p-6">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h2 className="text-xl md:text-2xl">Artists</h2>
                  <p className="text-sm text-muted-foreground">Choose who you want for your appointment.</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(parlour.staff ?? []).map((m: any) => (
                  <Link
                    key={m.id}
                    href={`/staff/${m.id}`}
                    className="rounded-xl border bg-card/60 p-4 shadow-soft hover:bg-card/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl border bg-gradient-to-br from-primary/12 to-accent/10 overflow-hidden">
                        {m.profileImage ? (
                          <img src={m.profileImage} alt={m.name} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold truncate">{m.name}</div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {m.specialization} • {m.experience} yrs
                        </div>
                      </div>
                      <Badge variant="secondary" className="gap-1">
                        <Star className="h-3.5 w-3.5" />
                        {ratingNumber(m.rating).toFixed(1)}
                      </Badge>
                    </div>
                  </Link>
                ))}
                {(parlour.staff?.length ?? 0) === 0 ? (
                  <div className="sm:col-span-2">
                    <EmptyState
                      icon={Users}
                      title="No staff profiles yet"
                      description="Owners can add staff from the Owner Dashboard."
                      actionLabel="Owner dashboard"
                      onAction={() => setLocation("/owner")}
                    />
                  </div>
                ) : null}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="glass noise-overlay p-5 md:p-6">
              <h3 className="text-lg">Contact</h3>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5" />
                  <span>{parlour.address}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{parlour.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{parlour.email}</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-2">
                <Button onClick={() => setLocation(`/book/parlour/${id}`)}>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Book appointment
                </Button>
                <Link
                  href="/bookings"
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 bg-card/60 hover:bg-card font-semibold"
                >
                  View booking history
                </Link>
              </div>
            </Card>

            <Card className="glass noise-overlay p-5 md:p-6">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h3 className="text-lg inline-flex items-center gap-2">
                    <Images className="h-4 w-4" />
                    Gallery
                  </h3>
                  <div className="text-xs text-muted-foreground mt-1">Looks, finishes, transformations.</div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {(gallery ?? parlour.galleryImages ?? []).slice(0, 6).map((g: any) => (
                  <div key={g.id ?? g.imageUrl} className="relative rounded-lg border overflow-hidden bg-muted/30">
                    {g.imageUrl ? (
                      <img src={g.imageUrl} alt={g.caption ?? "Gallery"} className="h-24 w-full object-cover" />
                    ) : (
                      <div className="h-24 w-full bg-gradient-to-br from-primary/14 to-accent/10" />
                    )}
                  </div>
                ))}
                {(gallery ?? parlour.galleryImages ?? []).length === 0 ? (
                  <div className="col-span-2 text-sm text-muted-foreground">
                    Gallery is empty. Owners can add images from the dashboard.
                  </div>
                ) : null}
              </div>

              <div className="mt-4">
                <Link
                  href="/owner"
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 bg-card/60 hover:bg-card font-semibold w-full"
                >
                  Owner: Manage gallery
                </Link>
              </div>
            </Card>
          </div>
        </div>
      )}
    </PageShell>
  );
}
