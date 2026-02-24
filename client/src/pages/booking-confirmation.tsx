import * as React from "react";
import { useParams, Link } from "wouter";
import { PageShell, SectionHeader } from "@/components/shell";
import { useBooking } from "@/hooks/use-bookings";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarCheck, Ticket, MapPin, User, Clock } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

function formatDate(d: any) {
  try {
    const dt = new Date(d);
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(dt);
  } catch {
    return String(d ?? "");
  }
}

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string }>();
  const idNum = Number(params.id);

  const { data, isLoading, error, refetch } = Number.isFinite(idNum) ? useBooking(idNum) : ({ data: null, isLoading: false, error: null, refetch: () => {} } as any);

  const booking = data as any;

  return (
    <PageShell>
      <SectionHeader
        title="Booking confirmed"
        subtitle="You’re all set. Keep your booking ID handy—owners can update status from their dashboard."
        right={
          <>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-2 text-sm font-semibold rounded-md border px-3 py-2 bg-card/60 hover:bg-card"
            >
              <Ticket className="h-4 w-4" />
              My Bookings
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold rounded-md border px-3 py-2 bg-card/60 hover:bg-card"
            >
              Browse cities
            </Link>
          </>
        }
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-float-in">
        <div className="lg:col-span-7">
          {isLoading ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : error ? (
            <EmptyState
              icon={CalendarCheck}
              title="Couldn’t load booking"
              description={(error as Error).message}
              actionLabel="Try again"
              onAction={() => refetch()}
            />
          ) : !booking ? (
            <EmptyState
              icon={CalendarCheck}
              title="Booking created"
              description="We couldn't fetch full details yet (API may be pending). Your booking should still be recorded."
              actionLabel="Go to My Bookings"
              onAction={() => (window.location.href = "/bookings")}
            />
          ) : (
            <Card className="glass noise-overlay p-6 md:p-7">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs text-muted-foreground">Booking ID</div>
                  <div className="text-3xl md:text-4xl font-bold tabular-nums mt-1">
                    #{booking.id}
                  </div>
                </div>
                <Badge variant="secondary" className="gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  {String(booking.status ?? "pending").toUpperCase()}
                </Badge>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border bg-card/60 p-4 shadow-soft">
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Parlour
                  </div>
                  <div className="mt-2 font-semibold">{booking.parlour?.name ?? "—"}</div>
                  <div className="mt-1 text-muted-foreground">{booking.parlour?.address ?? ""}</div>
                </div>

                <div className="rounded-xl border bg-card/60 p-4 shadow-soft">
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" />
                    When
                  </div>
                  <div className="mt-2 font-semibold">{formatDate(booking.bookingDate)}</div>
                  <div className="mt-1 text-muted-foreground">
                    {booking.service?.duration ? `${booking.service.duration} mins` : ""}
                  </div>
                </div>

                <div className="rounded-xl border bg-card/60 p-4 shadow-soft">
                  <div className="text-xs text-muted-foreground">Service</div>
                  <div className="mt-2 font-semibold">{booking.service?.name ?? "—"}</div>
                  <div className="mt-1 text-muted-foreground">
                    {booking.service?.price ? `₹${Number(booking.service.price).toFixed(0)}` : ""}
                  </div>
                </div>

                <div className="rounded-xl border bg-card/60 p-4 shadow-soft">
                  <div className="text-xs text-muted-foreground inline-flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Artist
                  </div>
                  <div className="mt-2 font-semibold">{booking.staff?.name ?? "—"}</div>
                  <div className="mt-1 text-muted-foreground">{booking.staff?.specialization ?? ""}</div>
                </div>
              </div>

              {booking.notes ? (
                <div className="mt-4 rounded-xl border bg-muted/40 p-4">
                  <div className="text-xs text-muted-foreground">Notes</div>
                  <div className="mt-1 text-sm leading-relaxed">{booking.notes}</div>
                </div>
              ) : null}

              <div className="mt-6 flex items-center justify-end gap-2 flex-wrap">
                <Link
                  href={booking.parlour?.id ? `/parlours/${booking.parlour.id}` : "/"}
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 bg-card/60 hover:bg-card font-semibold"
                >
                  View parlour
                </Link>
                <Link
                  href="/bookings"
                  className="inline-flex items-center justify-center rounded-md border px-4 py-2 bg-gradient-to-r from-primary/12 to-accent/12 font-semibold"
                >
                  Go to My Bookings
                </Link>
              </div>
            </Card>
          )}
        </div>

        <div className="lg:col-span-5">
          <Card className="glass noise-overlay p-6 md:p-7">
            <h3 className="text-xl">Next: manage your booking</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Use your email on “My Bookings” to see status changes. Owners can confirm, complete, or cancel.
            </p>

            <div className="mt-6 grid gap-2">
              <Link
                href="/bookings"
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 bg-card/60 hover:bg-card font-semibold"
              >
                Open My Bookings
              </Link>
              <Link
                href="/owner"
                className="inline-flex items-center justify-center rounded-md border px-4 py-2 bg-card/60 hover:bg-card font-semibold"
              >
                Owner dashboard
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
