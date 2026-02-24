import * as React from "react";
import { PageShell, SectionHeader } from "@/components/shell";
import { useBookings, useUpdateBooking, useDeleteBooking } from "@/hooks/use-bookings";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Ticket, Search, Trash2, RefreshCcw, CalendarDays, MapPin } from "lucide-react";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import { getOwnerSession } from "@/hooks/use-owner";

function formatDate(d: any) {
  try {
    const dt = new Date(d);
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(dt);
  } catch {
    return String(d ?? "");
  }
}

const STATUS = ["pending", "confirmed", "completed", "cancelled"] as const;

export default function UserBookingsPage() {
  const { toast } = useToast();
  const owner = getOwnerSession();

  const [email, setEmail] = React.useState(() => localStorage.getItem("beauty.customerEmail") ?? "");
  const [status, setStatus] = React.useState<string>("");

  const { data, isLoading, error, refetch } = useBookings({
    customerEmail: email || undefined,
    status: (status as any) || undefined,
  });

  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();

  const [confirm, setConfirm] = React.useState<{ open: boolean; id?: number }>({ open: false });

  const bookings = (data ?? []) as any[];

  const canOwnerEdit = !!owner;

  const setBookingStatus = async (id: number, next: string) => {
    try {
      await updateBooking.mutateAsync({ id, updates: { status: next } as any });
      toast({ title: "Updated", description: `Booking marked as ${next}.` });
    } catch (e) {
      toast({ title: "Update failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const removeBooking = async (id: number) => {
    try {
      await deleteBooking.mutateAsync(id);
      toast({ title: "Deleted", description: "Booking removed." });
    } catch (e) {
      toast({ title: "Delete failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <PageShell>
      <SectionHeader
        title="My bookings"
        subtitle="Search by email. Owners can also manage bookings from the Owner Dashboard."
        right={
          <Button variant="secondary" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      <Card className="mt-6 glass noise-overlay p-5 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-6">
            <div className="text-xs font-semibold text-muted-foreground mb-2 inline-flex items-center gap-2">
              <Search className="h-3.5 w-3.5" />
              Customer email
            </div>
            <Input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                localStorage.setItem("beauty.customerEmail", e.target.value);
              }}
              placeholder="you@email.com"
              type="email"
            />
          </div>

          <div className="md:col-span-3">
            <div className="text-xs font-semibold text-muted-foreground mb-2">Status</div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant={status ? "secondary" : "default"} onClick={() => setStatus("")}>
                All
              </Button>
              <Button variant="secondary" onClick={() => setStatus("pending")}>
                Pending
              </Button>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs font-semibold text-muted-foreground mb-2">Quick filters</div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setStatus("confirmed")}>
                Confirmed
              </Button>
              <Button variant="secondary" onClick={() => setStatus("completed")}>
                Completed
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        {isLoading ? (
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={Ticket}
            title="Couldn’t load bookings"
            description={(error as Error).message}
            actionLabel="Try again"
            onAction={() => refetch()}
          />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title="No bookings found"
            description="Try entering the email you used while booking. If you just booked, refresh in a moment."
          />
        ) : (
          <div className="grid gap-3 animate-float-in">
            {bookings.map((b) => (
              <Card key={b.id} className="bg-card/75 shadow-soft border border-border">
                <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">Booking</div>
                        <div className="text-lg font-semibold truncate">#{b.id} • {b.parlour?.name ?? "Parlour"}</div>
                      </div>
                      <Badge variant="secondary">{String(b.status ?? "pending").toUpperCase()}</Badge>
                    </div>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <div className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(b.bookingDate)}
                      </div>
                      <div className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {b.service?.name ?? "Service"} • {b.staff?.name ?? "Artist"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 flex-wrap">
                    {canOwnerEdit ? (
                      <>
                        {STATUS.map((s) => (
                          <Button
                            key={s}
                            variant={String(b.status) === s ? "default" : "secondary"}
                            onClick={() => setBookingStatus(b.id, s)}
                            disabled={updateBooking.isPending}
                          >
                            {s}
                          </Button>
                        ))}
                      </>
                    ) : null}

                    <Button
                      variant="destructive"
                      onClick={() => setConfirm({ open: true, id: b.id })}
                      disabled={deleteBooking.isPending}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))}
        title="Delete booking?"
        description="This will remove the booking record. This action can’t be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          const id = confirm.id;
          setConfirm({ open: false });
          if (typeof id === "number") removeBooking(id);
        }}
      />
    </PageShell>
  );
}
