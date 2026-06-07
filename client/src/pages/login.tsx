import * as React from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageShell } from "@/components/shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useLogin, useCurrentUser } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, LogIn } from "lucide-react";
import { BrandMark } from "@/components/brand";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();
  const { data: me } = useCurrentUser();

  React.useEffect(() => {
    if (me) setLocation("/");
  }, [me, setLocation]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginForm) => {
    try {
      await login.mutateAsync(values);
      toast({ title: "Welcome back!", description: "Logged in successfully." });
      setLocation("/");
    } catch (e) {
      toast({ title: "Login failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <PageShell>
      <div className="max-w-md mx-auto mt-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandMark />
          </div>
          <h1 className="text-3xl font-bold">Sign in</h1>
          <p className="text-muted-foreground mt-2">Welcome back to BeautyBook</p>
        </div>

        <Card className="glass noise-overlay">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@email.com"
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
                          data-testid="input-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={login.isPending}
                  data-testid="button-login"
                >
                  {login.isPending ? (
                    "Signing in..."
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign in
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-5 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-foreground hover:underline">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
