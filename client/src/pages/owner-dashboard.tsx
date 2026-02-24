import * as React from "react";
import { useLocation } from "wouter";
import { PageShell, SectionHeader } from "@/components/shell";
import { getOwnerSession, ownerLogout } from "@/hooks/use-owner";
import { useParlour, useUpdateParlour } from "@/hooks/use-parlours";
import { useServices, useCreateService, useUpdateService, useDeleteService } from "@/hooks/use-services";
import { useStaffList, useCreateStaff, useUpdateStaff, useDeleteStaff } from "@/hooks/use-staff";
import { useBookings, useUpdateBooking, useDeleteBooking } from "@/hooks/use-bookings";
import { useGallery, useCreateGalleryImage, useDeleteGalleryImage } from "@/hooks/use-gallery";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { ServiceFormDialog } from "@/components/forms/service-form-dialog";
import { StaffFormDialog } from "@/components/forms/staff-form-dialog";
import { GalleryFormDialog } from "@/components/forms/gallery-form-dialog";
import { ParlourDetailsForm } from "@/components/forms/parlour-details-form";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";

import {
  LayoutDashboard,
  Settings2,
  Scissors,
  Users,
  Ticket,
  Images,
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  Star,
} from "lucide-react";

function formatDate(d: any) {
  try {
    const dt = new Date(d);
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(dt);
  } catch {
    return String(d ?? "");
  }
}

const STATUSES = ["pending", "confirmed", "completed", "cancelled"] as const;

export default function OwnerDashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const owner = getOwnerSession();

  React.useEffect(() => {
    if (!owner) setLocation("/owner");
  }, [owner, setLocation]);

  const parlourId = owner?.parlourId ?? -1;

  const { data: parlourData, isLoading: parlourLoading, error: parlourError, refetch: refetchParlour } = useParlour(parlourId);
  const parlour = parlourData as any;

  const updateParlour = useUpdateParlour();

  const { data: servicesData, refetch: refetchServices } = useServices({ parlourId });
  const services = (servicesData ?? parlour?.services ?? []) as any[];

  const { data: staffData, refetch: refetchStaff } = useStaffList({ parlourId });
  const staff = (staffData ?? parlour?.staff ?? []) as any[];

  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = useBookings({ parlourId });
  const bookings = (bookingsData ?? []) as any[];

  const { data: galleryData, refetch: refetchGallery } = useGallery(parlourId);
  const gallery = (galleryData ?? parlour?.galleryImages ?? []) as any[];

  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();

  const updateBooking = useUpdateBooking();
  const deleteBooking = useDeleteBooking();

  const createGallery = useCreateGalleryImage();
  const deleteGallery = useDeleteGalleryImage();

  const [serviceDialog, setServiceDialog] = React.useState<{ open: boolean; editing?: any | null }>({
    open: false,
    editing: null,
  });
  const [staffDialog, setStaffDialog] = React.useState<{ open: boolean; editing?: any | null }>({
    open: false,
    editing: null,
  });
  const [galleryDialogOpen, setGalleryDialogOpen] = React.useState(false);

  const [confirm, setConfirm] = React.useState<{ open: boolean; kind: "service" | "staff" | "booking" | "gallery"; id?: number }>({
    open: false,
    kind: "service",
    id: undefined,
  });

  const refreshAll = () => {
    refetchParlour();
    refetchServices();
    refetchStaff();
    refetchBookings();
    refetchGallery();
  };

  if (!owner) return null;

  return (
    <PageShell>
      <SectionHeader
        title="Owner Dashboard"
        subtitle="Everything you need to run a premium parlour—services, staff, bookings, and a curated gallery."
        right={
          <>
            <Button variant="secondary" onClick={refreshAll}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                ownerLogout();
                setLocation("/owner");
              }}
            >
              Logout
            </Button>
          </>
        }
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-float-in">
        <div className="lg:col-span-4 space-y-4">
          <Card className="glass noise-overlay p-5 md:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Signed in as</div>
                <div className="text-xl font-semibold">{owner.parlourName}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Owner code: <span className="font-semibold">{owner.ownerCode}</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl border bg-gradient-to-br from-primary/14 to-accent/10 shadow-soft grid place-items-center">
                <LayoutDashboard className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl border bg-card/60 p-4 shadow-soft">
                <div className="text-xs text-muted-foreground">Services</div>
                <div className="mt-1 text-2xl font-bold tabular-nums">{services.length}</div>
              </div>
              <div className="rounded-xl border bg-card/60 p-4 shadow-soft">
                <div className="text-xs text-muted-foreground">Staff</div>
                <div className="mt-1 text-2xl font-bold tabular-nums">{staff.length}</div>
              </div>
              <div className="rounded-xl border bg-card/60 p-4 shadow-soft">
                <div className="text-xs text-muted-foreground">Bookings</div>
                <div className="mt-1 text-2xl font-bold tabular-nums">{bookings.length}</div>
              </div>
              <div className="rounded-xl border bg-card/60 p-4 shadow-soft">
                <div className="text-xs text-muted-foreground">Gallery</div>
                <div className="mt-1 text-2xl font-bold tabular-nums">{gallery.length}</div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold">
                <Star className="h-4 w-4" />
                Reputation
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Rating and reviews are seeded. In future, customers can review after appointments.
              </div>
            </div>
          </Card>

          {parlourLoading ? <Skeleton className="h-64 rounded-xl" /> : parlourError ? (
            <EmptyState
              icon={Settings2}
              title="Couldn’t load parlour"
              description={(parlourError as Error).message}
              actionLabel="Try again"
              onAction={() => refetchParlour()}
            />
          ) : parlour ? (
            <ParlourDetailsForm
              parlour={parlour}
              isPending={updateParlour.isPending}
              onSubmit={async (updates) => {
                try {
                  await updateParlour.mutateAsync({ id: parlourId, updates: updates as any });
                  toast({ title: "Saved", description: "Parlour details updated." });
                } catch (e) {
                  toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
                }
              }}
            />
          ) : null}
        </div>

        <div className="lg:col-span-8">
          <Tabs defaultValue="services">
            <TabsList className="grid grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="services" className="gap-2">
                <Scissors className="h-4 w-4" /> Services
              </TabsTrigger>
              <TabsTrigger value="staff" className="gap-2">
                <Users className="h-4 w-4" /> Staff
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <Ticket className="h-4 w-4" /> Bookings
              </TabsTrigger>
              <TabsTrigger value="gallery" className="gap-2">
                <Images className="h-4 w-4" /> Gallery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="services" className="mt-4">
              <Card className="glass noise-overlay p-5 md:p-6">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <h2 className="text-xl md:text-2xl">Services</h2>
                    <p className="text-sm text-muted-foreground">Create a crisp menu—clients book faster.</p>
                  </div>
                  <Button onClick={() => setServiceDialog({ open: true, editing: null })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add service
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((s) => (
                    <div key={s.id} className="rounded-xl border bg-card/60 p-4 shadow-soft">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{s.name}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {s.category} • {s.duration} mins
                          </div>
                        </div>
                        <div className="text-sm font-bold tabular-nums">₹{Number(s.price ?? 0).toFixed(0)}</div>
                      </div>

                      {s.description ? (
                        <div className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">{s.description}</div>
                      ) : null}

                      <div className="mt-4 flex items-center justify-end gap-2 flex-wrap">
                        <Button variant="secondary" onClick={() => setServiceDialog({ open: true, editing: s })}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setConfirm({ open: true, kind: "service", id: s.id })}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}

                  {services.length === 0 ? (
                    <div className="sm:col-span-2">
                      <EmptyState
                        icon={Scissors}
                        title="No services yet"
                        description="Add your top 6–10 offerings with clear pricing and duration."
                        actionLabel="Add service"
                        onAction={() => setServiceDialog({ open: true, editing: null })}
                      />
                    </div>
                  ) : null}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="staff" className="mt-4">
              <Card className="glass noise-overlay p-5 md:p-6">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <h2 className="text-xl md:text-2xl">Staff</h2>
                    <p className="text-sm text-muted-foreground">Great profiles build trust. Keep bios tight.</p>
                  </div>
                  <Button onClick={() => setStaffDialog({ open: true, editing: null })}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add staff
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {staff.map((m) => (
                    <div key={m.id} className="rounded-xl border bg-card/60 p-4 shadow-soft">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl border bg-gradient-to-br from-primary/12 to-accent/10 overflow-hidden">
                          {m.profileImage ? <img src={m.profileImage} alt={m.name} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">{m.name}</div>
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {m.specialization} • {m.experience} yrs
                          </div>
                        </div>
                        <Badge variant={m.isAvailableForHire ? "secondary" : "outline"}>
                          {m.isAvailableForHire ? "For hire" : "Hidden"}
                        </Badge>
                      </div>

                      {m.bio ? (
                        <div className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-2">{m.bio}</div>
                      ) : null}

                      <div className="mt-4 flex items-center justify-end gap-2 flex-wrap">
                        <Button variant="secondary" onClick={() => setStaffDialog({ open: true, editing: m })}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setConfirm({ open: true, kind: "staff", id: m.id })}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}

                  {staff.length === 0 ? (
                    <div className="sm:col-span-2">
                      <EmptyState
                        icon={Users}
                        title="No staff profiles yet"
                        description="Add your best artists first—clients love choosing their specialist."
                        actionLabel="Add staff"
                        onAction={() => setStaffDialog({ open: true, editing: null })}
                      />
                    </div>
                  ) : null}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="mt-4">
              <Card className="glass noise-overlay p-5 md:p-6">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <h2 className="text-xl md:text-2xl">Bookings</h2>
                    <p className="text-sm text-muted-foreground">Update status to keep clients in the loop.</p>
                  </div>
                  <Button variant="secondary" onClick={() => refetchBookings()}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="mt-4">
                  {bookingsLoading ? (
                    <div className="grid gap-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                      ))}
                    </div>
                  ) : bookings.length === 0 ? (
                    <EmptyState
                      icon={Ticket}
                      title="No bookings yet"
                      description="Once customers book, they’ll show up here with service and staff details."
                    />
                  ) : (
                    <div className="grid gap-3">
                      {bookings.map((b) => (
                        <div key={b.id} className="rounded-xl border bg-card/60 p-4 shadow-soft">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-xs text-muted-foreground">Booking #{b.id}</div>
                                  <div className="font-semibold truncate">{b.customerName} • {b.customerEmail}</div>
                                </div>
                                <Badge variant="secondary">{String(b.status ?? "pending").toUpperCase()}</Badge>
                              </div>
                              <div className="mt-2 text-sm text-muted-foreground">
                                {formatDate(b.bookingDate)} • {b.service?.name ?? "Service"} • {b.staff?.name ?? "Staff"}
                              </div>
                              {b.notes ? <div className="mt-2 text-sm leading-relaxed">{b.notes}</div> : null}
                            </div>

                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              {STATUSES.map((s) => (
                                <Button
                                  key={s}
                                  variant={String(b.status) === s ? "default" : "secondary"}
                                  onClick={async () => {
                                    try {
                                      await updateBooking.mutateAsync({ id: b.id, updates: { status: s } as any });
                                      toast({ title: "Updated", description: `Booking marked as ${s}.` });
                                    } catch (e) {
                                      toast({ title: "Update failed", description: (e as Error).message, variant: "destructive" });
                                    }
                                  }}
                                  disabled={updateBooking.isPending}
                                >
                                  {s}
                                </Button>
                              ))}
                              <Button
                                variant="destructive"
                                onClick={() => setConfirm({ open: true, kind: "booking", id: b.id })}
                                disabled={deleteBooking.isPending}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="gallery" className="mt-4">
              <Card className="glass noise-overlay p-5 md:p-6">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <h2 className="text-xl md:text-2xl">Gallery</h2>
                    <p className="text-sm text-muted-foreground">Show transformations and signature looks.</p>
                  </div>
                  <Button onClick={() => setGalleryDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add image
                  </Button>
                </div>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gallery.map((g) => (
                    <div key={g.id} className="rounded-xl border bg-card/60 overflow-hidden shadow-soft">
                      <div className="aspect-[4/3] bg-muted/30">
                        {g.imageUrl ? (
                          <img src={g.imageUrl} alt={g.caption ?? "Gallery image"} className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                      <div className="p-3">
                        <div className="text-sm font-semibold truncate">{g.caption ?? "Untitled"}</div>
                        <div className="mt-2 flex items-center justify-end">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setConfirm({ open: true, kind: "gallery", id: g.id })}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {gallery.length === 0 ? (
                    <div className="col-span-2 md:col-span-3">
                      <EmptyState
                        icon={Images}
                        title="Gallery is empty"
                        description="Add 6–12 great images. Your listing will feel instantly premium."
                        actionLabel="Add image"
                        onAction={() => setGalleryDialogOpen(true)}
                      />
                    </div>
                  ) : null}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ServiceFormDialog
        open={serviceDialog.open}
        onOpenChange={(open) => setServiceDialog((s) => ({ ...s, open }))}
        parlourId={parlourId}
        initial={serviceDialog.editing ?? null}
        isPending={createService.isPending || updateService.isPending}
        onSubmit={async (values) => {
          try {
            if (serviceDialog.editing?.id) {
              await updateService.mutateAsync({ id: serviceDialog.editing.id, updates: values as any });
              toast({ title: "Saved", description: "Service updated." });
            } else {
              await createService.mutateAsync(values as any);
              toast({ title: "Created", description: "Service added." });
            }
            setServiceDialog({ open: false, editing: null });
          } catch (e) {
            toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
          }
        }}
      />

      <StaffFormDialog
        open={staffDialog.open}
        onOpenChange={(open) => setStaffDialog((s) => ({ ...s, open }))}
        parlourId={parlourId}
        initial={staffDialog.editing ?? null}
        isPending={createStaff.isPending || updateStaff.isPending}
        onSubmit={async (values) => {
          try {
            if (staffDialog.editing?.id) {
              await updateStaff.mutateAsync({ id: staffDialog.editing.id, updates: values as any });
              toast({ title: "Saved", description: "Staff updated." });
            } else {
              await createStaff.mutateAsync(values as any);
              toast({ title: "Created", description: "Staff added." });
            }
            setStaffDialog({ open: false, editing: null });
          } catch (e) {
            toast({ title: "Save failed", description: (e as Error).message, variant: "destructive" });
          }
        }}
      />

      <GalleryFormDialog
        open={galleryDialogOpen}
        onOpenChange={setGalleryDialogOpen}
        parlourId={parlourId}
        isPending={createGallery.isPending}
        onSubmit={async (values) => {
          try {
            await createGallery.mutateAsync(values as any);
            toast({ title: "Added", description: "Image added to gallery." });
            setGalleryDialogOpen(false);
          } catch (e) {
            toast({ title: "Add failed", description: (e as Error).message, variant: "destructive" });
          }
        }}
      />

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))}
        title={
          confirm.kind === "service"
            ? "Delete service?"
            : confirm.kind === "staff"
              ? "Delete staff?"
              : confirm.kind === "booking"
                ? "Delete booking?"
                : "Remove image?"
        }
        description="This action can’t be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          const id = confirm.id;
          const kind = confirm.kind;
          setConfirm((c) => ({ ...c, open: false }));

          if (typeof id !== "number") return;

          try {
            if (kind === "service") await deleteService.mutateAsync(id);
            if (kind === "staff") await deleteStaff.mutateAsync(id);
            if (kind === "booking") await deleteBooking.mutateAsync(id);
            if (kind === "gallery") await deleteGallery.mutateAsync(id);

            toast({ title: "Done", description: "Deleted successfully." });
          } catch (e) {
            toast({ title: "Delete failed", description: (e as Error).message, variant: "destructive" });
          }
        }}
      />
    </PageShell>
  );
}
