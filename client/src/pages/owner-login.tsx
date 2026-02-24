import * as React from "react";
import { useLocation } from "wouter";
import { PageShell, SectionHeader } from "@/components/shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOwnerLogin } from "@/hooks/use-owner";
import { useToast } from "@/hooks/use-toast";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function OwnerLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useOwnerLogin();

  const [code, setCode] = React.useState("");

  const submit = async () => {
    try {
      const session = await login.mutateAsync(code.trim());
      toast({ title: "Welcome", description: `Signed in as ${session.parlourName}.` });
      setLocation("/owner/dashboard");
    } catch (e) {
      toast({ title: "Login failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <PageShell>
      <SectionHeader
        title="Owner login"
        subtitle="Enter your unique parlour code to manage services, staff, bookings, and gallery."
      />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-float-in">
        <div className="lg:col-span-7">
          <Card className="glass noise-overlay p-6 md:p-8">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl border bg-gradient-to-br from-primary/14 to-accent/10 shadow-soft grid place-items-center">
                <KeyRound className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xl md:text-2xl font-semibold">Sign in with owner code</div>
                <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                  This Phase 1 login is code-based. Firebase auth can be added later for full role accounts.
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold text-muted-foreground mb-2">Owner code</div>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., VELVET-NLR-001"
              />
              <div className="mt-2 text-xs text-muted-foreground">
                Tip: your code is saved in the parlour record as <span className="font-semibold">ownerCode</span>.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="secondary" onClick={() => setLocation("/")}>
                Back to cities
              </Button>
              <Button onClick={submit} disabled={login.isPending}>
                {login.isPending ? "Signing in…" : "Login"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="glass noise-overlay p-6 md:p-8">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl border bg-gradient-to-br from-accent/18 to-primary/10 shadow-soft grid place-items-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xl font-semibold">Owner toolkit</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  In this dashboard you can:
                </p>
              </div>
            </div>

            <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
              <li>• Edit parlour details</li>
              <li>• Manage services (create, update, delete)</li>
              <li>• Manage staff (create, update, delete)</li>
              <li>• Manage bookings (status workflow)</li>
              <li>• Upload gallery (via URL for Phase 1)</li>
            </ul>

            <div className="mt-6 rounded-xl border bg-muted/40 p-4">
              <div className="text-sm font-semibold">Coming next</div>
              <div className="mt-1 text-sm text-muted-foreground leading-relaxed">
                Analytics, staff job offers, and professional posts with videos.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
