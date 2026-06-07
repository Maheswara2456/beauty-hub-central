import * as React from "react";
import { useLocation } from "wouter";
import { PageShell, SectionHeader } from "@/components/shell";
import { useCurrentUser } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/empty-state";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import {
  Shield,
  Users,
  Store,
  Ticket,
  Star,
  TrendingUp,
  Trash2,
  RefreshCcw,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number | string; sub?: string }) {
  return (
    <Card className="glass noise-overlay p-5 flex items-start gap-4">
      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <div className="text-sm font-medium">{label}</div>
        {sub ? <div className="text-xs text-muted-foreground mt-0.5">{sub}</div> : null}
      </div>
    </Card>
  );
}

function formatDate(d: any) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(d));
  } catch {
    return String(d ?? "");
  }
}

const ROLES = ["user", "owner", "staff", "admin"] as const;
const ROLE_COLORS: Record<string, string> = {
  admin: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  owner: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  staff: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  user: "bg-muted text-muted-foreground",
};

export default function AdminDashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: me, isLoading: meLoading } = useCurrentUser();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error("Forbidden");
      return res.json();
    },
    enabled: !!me && me.role === "admin",
    retry: false,
  });

  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (!res.ok) throw new Error("Forbidden");
      return res.json();
    },
    enabled: !!me && me.role === "admin",
    retry: false,
  });

  const { data: parlours, isLoading: parloursLoading, refetch: refetchParlours } = useQuery({
    queryKey: ["/api/admin/parlours"],
    queryFn: async () => {
      const res = await fetch("/api/admin/parlours", { credentials: "include" });
      if (!res.ok) throw new Error("Forbidden");
      return res.json();
    },
    enabled: !!me && me.role === "admin",
    retry: false,
  });

  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ["/api/admin/bookings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/bookings", { credentials: "include" });
      if (!res.ok) throw new Error("Forbidden");
      return res.json();
    },
    enabled: !!me && me.role === "admin",
    retry: false,
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, role, parlourId }: { id: number; role?: string; parlourId?: number | null }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, { role, parlourId });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated" });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });

  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`, undefined);
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User deleted" });
    },
    onError: (e) => toast({ title: "Error", description: (e as Error).message, variant: "destructive" }),
  });

  const [confirm, setConfirm] = React.useState<{ open: boolean; id?: number }>({ open: false });

  React.useEffect(() => {
    if (!meLoading && (!me || me.role !== "admin")) {
      setLocation("/");
    }
  }, [me, meLoading, setLocation]);

  if (meLoading) {
    return (
      <PageShell>
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </PageShell>
    );
  }

  if (!me || me.role !== "admin") return null;

  return (
    <PageShell>
      <SectionHeader
        title="Admin Dashboard"
        subtitle="Platform-wide management for BeautyBook"
        right={
          <Button variant="secondary" onClick={() => { refetchStats(); refetchUsers(); refetchParlours(); refetchBookings(); }}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
        ) : stats ? (
          <>
            <StatCard icon={Users} label="Total Users" value={stats.totalUsers} />
            <StatCard icon={Store} label="Parlours" value={stats.totalParlours} />
            <StatCard icon={Ticket} label="Bookings" value={stats.totalBookings} sub={`${stats.bookingsByStatus?.confirmed ?? 0} confirmed`} />
            <StatCard icon={Star} label="Reviews" value={stats.totalReviews} />
          </>
        ) : null}
      </div>

      {stats?.bookingsByStatus ? (
        <Card className="glass noise-overlay mt-4 p-5">
          <div className="text-sm font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Booking status breakdown
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.bookingsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2 rounded-lg border bg-card/60 px-3 py-2">
                <span className="text-xs font-semibold uppercase">{status}</span>
                <Badge variant="secondary">{String(count)}</Badge>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="mt-6">
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="parlours" data-testid="tab-parlours">
              <Store className="h-4 w-4 mr-2" />
              Parlours
            </TabsTrigger>
            <TabsTrigger value="bookings" data-testid="tab-bookings">
              <Ticket className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {usersLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : !users || users.length === 0 ? (
              <EmptyState icon={Users} title="No users yet" description="Users will appear here after they register." />
            ) : (
              <div className="grid gap-2">
                {(users as any[]).map((u) => (
                  <Card key={u.id} className="bg-card/75 border border-border">
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate" data-testid={`text-user-name-${u.id}`}>{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{formatDate(u.createdAt)}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ROLE_COLORS[u.role] ?? ROLE_COLORS.user}`}>
                          {u.role}
                        </span>
                        <Select
                          value={u.role}
                          onValueChange={(role) => updateUser.mutate({ id: u.id, role })}
                        >
                          <SelectTrigger className="h-8 w-28 text-xs" data-testid={`select-role-${u.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLES.map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setConfirm({ open: true, id: u.id })}
                          disabled={u.id === me.id}
                          data-testid={`button-delete-user-${u.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="parlours">
            {parloursLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : !parlours || parlours.length === 0 ? (
              <EmptyState icon={Store} title="No parlours" description="Parlours will appear here." />
            ) : (
              <div className="grid gap-2">
                {(parlours as any[]).map((p) => (
                  <Card key={p.id} className="bg-card/75 border border-border">
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{p.address}</div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3" />
                          {Number(p.rating ?? 0).toFixed(1)}
                        </Badge>
                        <Badge variant="outline">{p.totalReviews ?? 0} reviews</Badge>
                        <Button variant="secondary" size="sm" onClick={() => setLocation(`/parlours/${p.id}`)}>
                          View
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            {bookingsLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : !bookings || bookings.length === 0 ? (
              <EmptyState icon={Ticket} title="No bookings" description="Bookings will appear here." />
            ) : (
              <div className="grid gap-2">
                {(bookings as any[]).slice(0, 50).map((b) => (
                  <Card key={b.id} className="bg-card/75 border border-border">
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">#{b.id} — {b.parlour?.name ?? "Parlour"}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {b.customerName} • {b.customerEmail}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{formatDate(b.bookingDate)}</div>
                      </div>
                      <Badge variant="secondary">{b.status?.toUpperCase()}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))}
        title="Delete user?"
        description="This will permanently remove the user and all their data."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          const id = confirm.id;
          setConfirm({ open: false });
          if (typeof id === "number") deleteUser.mutate(id);
        }}
      />
    </PageShell>
  );
}
