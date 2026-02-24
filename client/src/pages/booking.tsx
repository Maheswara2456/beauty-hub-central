import * as React from "react";
import { z } from "zod";
import { useParams, useLocation, Link } from "wouter";
import { PageShell, SectionHeader } from "@/components/shell";
import { useParlour } from "@/hooks/use-parlours";
import { useCreateBooking } from "@/hooks/use-bookings";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, ArrowLeft, Clock, Users, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const bookingSchema = z.object({
  serviceId: z.coerce.number(),
  staffId: z.coerce.number(),
  customerName: z.string().min(2, "Name is too short"),
  customerEmail: z.string().email("Enter a valid email"),
  customerPhone: z.string().min(8, "Enter a valid phone"),
  bookingDate: z.string().min(1),
  notes: z.string().optional(),
});

export default function BookingPage() {
  const params = useParams<{ parlourId: string }>();
  const parlourId = Number(params.parlourId);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data, isLoading } = useParlour(parlourId);
  const parlour = data as any;

  const createBooking = useCreateBooking();

  const [serviceId, setServiceId] = React.useState<string>("");
  const [staffId, setStaffId] = React.useState<string>("");
  const [date, setDate] = React.useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(11, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  });
  const [customerName, setCustomerName] = React.useState("");
  const [customerEmail, setCustomerEmail] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const services = (parlour?.services ?? []) as any[];
  const staff = (parlour?.staff ?? []) as any[];

  React.useEffect(() => {
    if (!serviceId && services[0]?.id) setServiceId(String(services[0].id));
    if (!staffId && staff[0]?.id) setStaffId(String(staff[0].id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parlourId, parlour?.id]);

  const selectedService = services.find((s) => String(s?.id) === String(serviceId));
  const selectedStaff = staff.find((m) => String(m?.id) === String(staffId));

  const onSubmit = async () => {
    const parsed = bookingSchema.safeParse({
      serviceId,
      staffId,
      customerName,
      customerEmail,
      customerPhone,
      bookingDate: date,
      notes,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0];
      toast({
        title: "Please check your details",
        description: first?.message ?? "Validation error",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        parlourId,
        serviceId: Number(parsed.data.serviceId),
        staffId: Number(parsed.data.staffId),
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        customerPhone: parsed.data.customerPhone,
        bookingDate: new Date(parsed.data.bookingDate),
        status: "pending",
        notes: parsed.data.notes || null,
      } as any;

      const created = await createBooking.mutateAsync(payload);
      const bookingId = (created as any)?.id;

      // remember email for bookings page
      localStorage.setItem("beauty.customerEmail", parsed.data.customerEmail);

      setLocation(`/book/confirmation/${bookingId ?? "latest"}`);
    } catch (e) {
      toast({
        title: "Booking failed",
        description: (e as Error).message,
        variant: "destructive",
      });
    }
  };

  return (
    <PageShell>
      <SectionHeader
        title="Book your appointment"
        subtitle="Select your service, choose an artist, and lock your slot. You’ll get a confirmation instantly."
        right={
          <>
            <Link
              href={parlour?.id ? `/parlours/${parlour.id}` : "/"}
              className="inline-flex items-center gap-2 text-sm font-semibold rounded-md border px-3 py-2 bg-card/60 hover:bg-card"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-2 text-sm font-semibold rounded-md border px-3 py-2 bg-card/60 hover:bg-card"
            >
              My Bookings
            </Link>
          </>
        }
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-float-in">
        <div className="lg:col-span-7 space-y-6">
          <Card className="glass noise-overlay p-5 md:p-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <div className="text-lg font-semibold">{parlour?.name ?? (isLoading ? "Loading…" : "Parlour")}</div>
                <div className="text-xs text-muted-foreground mt-1">{parlour?.address ?? " "}</div>
              </div>
              <Badge variant="secondary" className="gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                Premium flow
              </Badge>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">Service</div>
                <Select value={serviceId || undefined} onValueChange={(v) => setServiceId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name} — ₹{Number(s.price ?? 0).toFixed(0)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedService ? (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" />
                      {selectedService.duration} mins • {selectedService.category}
                    </span>
                  </div>
                ) : null}
              </div>

              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">Artist</div>
                <Select value={staffId || undefined} onValueChange={(v) => setStaffId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name} — {m.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedStaff ? (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Users className="h-3.5 w-3.5" />
                      {selectedStaff.experience} yrs • {selectedStaff.specialization}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Date & time</div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-[240px]">
                    <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <Badge variant="outline" className="gap-2">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Local time
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="glass noise-overlay p-5 md:p-6">
            <h2 className="text-xl md:text-2xl">Your details</h2>
            <p className="mt-1 text-sm text-muted-foreground">Used to confirm and manage your booking.</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">Name</div>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-2">Phone</div>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+91…" />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Email</div>
                <Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="you@email.com" type="email" />
              </div>
              <div className="md:col-span-2">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Notes (optional)</div>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, preferences, references…" className="min-h-[110px]" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setLocation(parlour?.id ? `/parlours/${parlour.id}` : "/")}>
                Cancel
              </Button>
              <Button disabled={createBooking.isPending} onClick={onSubmit}>
                {createBooking.isPending ? "Confirming…" : "Confirm booking"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="glass noise-overlay p-5 md:p-6">
            <h3 className="text-lg">Summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Service</span>
                <span className="font-semibold">{selectedService?.name ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Artist</span>
                <span className="font-semibold">{selectedStaff?.name ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold">{selectedService?.duration ? `${selectedService.duration} mins` : "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">Price</span>
                <span className="font-semibold tabular-nums">
                  {selectedService?.price ? `₹${Number(selectedService.price).toFixed(0)}` : "—"}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-4">
              <div className="text-sm font-semibold">Tip</div>
              <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                For bridal or advanced treatments, add a note with references. Your artist will prep everything in advance.
              </div>
            </div>
          </Card>

          <Card className="glass noise-overlay p-5 md:p-6">
            <h3 className="text-lg">After booking</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground leading-relaxed">
              <li>• You’ll land on a confirmation page with your booking ID.</li>
              <li>• Use “My Bookings” to track status updates.</li>
              <li>• Owners can confirm / complete / cancel bookings from the dashboard.</li>
            </ul>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
