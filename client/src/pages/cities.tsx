import * as React from "react";
import { Link } from "wouter";
import { useCities } from "@/hooks/use-cities";
import { PageShell, SectionHeader } from "@/components/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, ArrowUpRight, Sparkles, Building2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

function CityCard({ city }: { city: { id: number; name: string; state: string } }) {
  return (
    <Link
      href={`/cities/${city.id}/parlours`}
      className="block"
    >
      <Card className="group glass noise-overlay hover:shadow-luxe transition-shadow">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate">{city.state}</span>
              </div>
              <div className="mt-2 text-2xl md:text-3xl font-bold leading-tight">
                {city.name}
              </div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Curated parlours, standout artists, and silky-smooth booking.
              </p>
            </div>

            <div className="shrink-0">
              <div className="h-10 w-10 rounded-xl border bg-gradient-to-br from-primary/14 to-accent/12 shadow-soft grid place-items-center">
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" />
              Explore parlours
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold rounded-full border bg-card/60 px-3 py-1">
              <Sparkles className="h-3.5 w-3.5" />
              Recommended
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function CitiesPage() {
  const { data, isLoading, error, refetch } = useCities();

  return (
    <PageShell>
      <SectionHeader
        title="Choose your city"
        subtitle="A premium booking experience for salons and parlours across South India—designed to feel effortless."
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={MapPin}
              title="Couldn’t load cities"
              description={(error as Error).message}
              actionLabel="Try again"
              onAction={() => refetch()}
            />
          ) : (data?.length ?? 0) === 0 ? (
            <EmptyState
              icon={MapPin}
              title="No cities yet"
              description="Once the database is seeded, your cities will appear here."
              actionLabel="Reload"
              onAction={() => refetch()}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-float-in">
              {data!.map((city) => (
                <CityCard key={city.id} city={city} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <Card className="glass noise-overlay p-5 md:p-6">
            <h2 className="text-xl md:text-2xl">How it works</h2>
            <ol className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3">
                <div className="h-8 w-8 rounded-xl border bg-gradient-to-br from-primary/14 to-accent/10 grid place-items-center font-bold">
                  1
                </div>
                <div>
                  <div className="font-semibold">Pick a city</div>
                  <div className="text-muted-foreground">
                    Discover top-rated parlours with elegant service menus.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="h-8 w-8 rounded-xl border bg-gradient-to-br from-primary/14 to-accent/10 grid place-items-center font-bold">
                  2
                </div>
                <div>
                  <div className="font-semibold">Choose service + staff</div>
                  <div className="text-muted-foreground">
                    Select the experience and the artist you want.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="h-8 w-8 rounded-xl border bg-gradient-to-br from-primary/14 to-accent/10 grid place-items-center font-bold">
                  3
                </div>
                <div>
                  <div className="font-semibold">Book in seconds</div>
                  <div className="text-muted-foreground">
                    Confirm your slot and track everything in My Bookings.
                  </div>
                </div>
              </li>
            </ol>
          </Card>

          <Card className="mt-4 glass noise-overlay p-5 md:p-6">
            <h3 className="text-lg">Owner access</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Own a parlour? Login with your unique owner code to manage services, staff, bookings, and gallery—no clutter.
            </p>
            <div className="mt-4">
              <Link
                href="/owner"
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 bg-gradient-to-r from-primary/12 to-accent/12 font-semibold"
              >
                Go to Owner Dashboard
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
