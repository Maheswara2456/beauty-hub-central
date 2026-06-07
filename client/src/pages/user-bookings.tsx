import * as React from "react";
import { PageShell, SectionHeader } from "@/components/shell";
import { useBookings, useUpdateBooking, useDeleteBooking } from "@/hooks/use-bookings";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Ticket, Search, Trash2, RefreshCcw, CalendarDays, MapPin, XCircle, Clock } from "lucide-react";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getOwnerSession } from "@/hooks/use-owner";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";

function formatDate(d: any) {
  try {
    const dt = new Date(d);
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(dt);
  } catch {
    return String(d ?? "");
  }
}

function toLocalDatetimeValue(d: any) {
  try {
    const dt = new Date(d);
    const offset = dt.getTimezoneOffset();
    const local = new Date(dt.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

const STATUS = ["pending", "confirmed", "completed", "cancelled"] as const;

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  cancelled: "bg-muted text-muted-foreground",
};

export default function UserBookingsPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
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
  const [cancelConfirm, setCancelConfirm] = React.useState<{ open: boolean; id?: number }>({ open: false });
  const [rescheduleDialog, setRescheduleDialog] = React.useState<{ open: boolean; id?: number; currentDate?: string }>({ open: false });
  const [newDate, setNewDate] = React.useState("");

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

  const cancelBooking = async (id: number) => {
    try {
      const res = await apiRequest("PATCH", `/api/bookings/${id}/cancel`, undefined);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to cancel" }));
        throw new Error(err.message);
      }
      qc.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({ title: "Booking cancelled", description: "Your booking has been cancelled." });
    } catch (e) {
      toast({ title: "Cancel failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const rescheduleBooking = async () => {
    if (!rescheduleDialog.id || !newDate) return;
    try {
      const res = await apiRequest("PATCH", `/api/bookings/${rescheduleDialog.id}/reschedule`, { bookingDate: newDate });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to reschedule" }));
        throw new Error(err.message);
      }
      qc.invalidateQueries({ queryKey: ["/api/bookings"] });
      setRescheduleDialog({ open: false });
      setNewDate("");
      toast({ title: "Booking rescheduled", description: "Your booking date has been updated." });
    } catch (e) {
      toast({ title: "Reschedule failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <PageShell>
      <SectionHeader
        title="My bookings"
        subtitle="Search by email. Cancel or reschedule upcoming bookings."
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
              data-testid="input-search-email"
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
            title="Couldn't load bookings"
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
              <Card key={b.id} className="bg-card/75 shadow-soft border border-border" data-testid={`card-booking-${b.id}`}>
                <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs text-muted-foreground">Booking</div>
                        <div className="text-lg font-semibold truncate">#{b.id} • {b.parlour?.name ?? "Parlour"}</div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0 ${STATUS_COLORS[b.status] ?? STATUS_COLORS.pending}`}
                        data-testid={`status-booking-${b.id}`}
                      >
                        {String(b.status ?? "pending").toUpperCase()}
                      </span>
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
                    {/* User-facing cancel/reschedule for active bookings */}
                    {!canOwnerEdit && (b.status === "pending" || b.status === "confirmed") ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRescheduleDialog({ open: true, id: b.id, currentDate: b.bookingDate });
                            setNewDate(toLocalDatetimeValue(b.bookingDate));
                          }}
                          data-testid={`button-reschedule-${b.id}`}
                        >
                          <Clock className="h-3.5 w-3.5 mr-1.5" />
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                          onClick={() => setCancelConfirm({ open: true, id: b.id })}
                          data-testid={`button-cancel-${b.id}`}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />
                          Cancel
                        </Button>
                      </>
                    ) : null}

                    {/* Owner controls */}
                    {canOwnerEdit ? (
                      <>
                        {STATUS.map((s) => (
                          <Button
                            key={s}
                            variant={String(b.status) === s ? "default" : "secondary"}
                            size="sm"
                            onClick={() => setBookingStatus(b.id, s)}
                            disabled={updateBooking.isPending}
                            data-testid={`button-status-${s}-${b.id}`}
                          >
                            {s}
                          </Button>
                        ))}
                      </>
                    ) : null}

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setConfirm({ open: true, id: b.id })}
                      disabled={deleteBooking.isPending}
                      data-testid={`button-delete-${b.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))}
        title="Delete booking?"
        description="This will remove the booking record. This action can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          const id = confirm.id;
          setConfirm({ open: false });
          if (typeof id === "number") removeBooking(id);
        }}
      />

      {/* Cancel confirm */}
      <ConfirmDialog
        open={cancelConfirm.open}
        onOpenChange={(open) => setCancelConfirm((c) => ({ ...c, open }))}
        title="Cancel booking?"
        description="Your booking will be marked as cancelled. This cannot be undone."
        confirmLabel="Cancel booking"
        destructive
        onConfirm={() => {
          const id = cancelConfirm.id;
          setCancelConfirm({ open: false });
          if (typeof id === "number") cancelBooking(id);
        }}
      />

      {/* Reschedule dialog */}
      <Dialog open={rescheduleDialog.open} onOpenChange={(open) => setRescheduleDialog((d) => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Reschedule booking
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <div className="text-sm font-medium mb-2">Current date</div>
              <div className="text-sm text-muted-foreground">
                {rescheduleDialog.currentDate ? formatDate(rescheduleDialog.currentDate) : "–"}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">New date &amp; time</div>
              <Input
                type="datetime-local"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                data-testid="input-new-date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRescheduleDialog({ open: false })}>
              Cancel
            </Button>
            <Button onClick={rescheduleBooking} disabled={!newDate} data-testid="button-confirm-reschedule">
              Confirm reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
