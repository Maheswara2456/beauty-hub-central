import * as React from "react";
import { useParams, Link } from "wouter";
import { PageShell, SectionHeader } from "@/components/shell";
import { useCity } from "@/hooks/use-cities";
import { useParlours } from "@/hooks/use-parlours";
import { ParlourCard } from "@/components/parlour-card";
import { ParlourFilters, type ParlourFilterState } from "@/components/filters/parlour-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function getCategories(parlours: any[]): string[] {
  const set = new Set<string>();
  parlours.forEach((p) => (p?.services ?? []).forEach((s: any) => s?.category && set.add(String(s.category))));
  return Array.from(set).slice(0, 20).sort((a, b) => a.localeCompare(b));
}

export default function ParloursPage() {
  const params = useParams<{ cityId: string }>();
  const cityId = Number(params.cityId);

  const { data: city } = useCity(cityId);

  const [filters, setFilters] = React.useState<ParlourFilterState>({
    search: "",
    minRating: 0,
    maxPrice: 3000,
    category: "",
    sortBy: "",
  });

  const { data, isLoading, error, refetch } = useParlours({
    cityId,
    minRating: filters.minRating || undefined,
    maxPrice: filters.maxPrice || undefined,
    category: filters.category || undefined,
    sortBy: (filters.sortBy || undefined) as any,
  });

  const filtered = React.useMemo(() => {
    const list = (data ?? []) as any[];
    const search = filters.search.trim().toLowerCase();
    return list
      .filter((p) => {
        if (!search) return true;
        const hay = `${p?.name ?? ""} ${(p?.address ?? "")}`.toLowerCase();
        return hay.includes(search);
      })
      .filter((p) => {
        if (!filters.category) return true;
        return (p?.services ?? []).some((s: any) => String(s?.category ?? "") === filters.category);
      })
      .filter((p) => {
        // maxPrice: parlour passes if any service price <= maxPrice, else keep if no services
        const max = filters.maxPrice ?? 3000;
        const services = (p?.services ?? []) as any[];
        if (services.length === 0) return true;
        const minServicePrice = Math.min(...services.map((s) => Number(s?.price ?? Infinity)));
        return Number.isFinite(minServicePrice) ? minServicePrice <= max : true;
      });
  }, [data, filters.category, filters.maxPrice, filters.search]);

  const categories = React.useMemo(() => getCategories((data ?? []) as any[]), [data]);

  return (
    <PageShell>
      <SectionHeader
        title={city ? `Parlours in ${city.name}` : "Parlours"}
        subtitle="Filter by rating, service type, and budget—then book your artist in a few taps."
        right={
          <>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold rounded-md border px-3 py-2 bg-card/60 hover:bg-card">
              <ArrowLeft className="h-4 w-4" />
              Cities
            </Link>
            <Link href="/bookings" className="inline-flex items-center gap-2 text-sm font-semibold rounded-md border px-3 py-2 bg-card/60 hover:bg-card">
              My Bookings
            </Link>
          </>
        }
      />

      <div className="mt-6">
        <ParlourFilters
          value={filters}
          onChange={setFilters}
          onReset={() =>
            setFilters({
              search: "",
              minRating: 0,
              maxPrice: 3000,
              category: "",
              sortBy: "",
            })
          }
          categories={categories}
        />
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Building2}
            title="Couldn’t load parlours"
            description={(error as Error).message}
            actionLabel="Try again"
            onAction={() => refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No matches"
            description="Try loosening filters or searching by another area."
            actionLabel="Reset filters"
            onAction={() =>
              setFilters({
                search: "",
                minRating: 0,
                maxPrice: 3000,
                category: "",
                sortBy: "",
              })
            }
          />
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filtered.length}</span> parlours
              </div>
              <Button variant="secondary" onClick={() => refetch()}>
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-float-in">
              {filtered.map((p) => (
                <ParlourCard key={p?.id} parlour={p} cityLabel={city ? `${city.name}` : undefined} />
              ))}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
