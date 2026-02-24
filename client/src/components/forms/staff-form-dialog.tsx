import * as React from "react";
import { z } from "zod";
import type { Staff } from "@shared/schema";
import { insertStaffSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const formSchema = insertStaffSchema.extend({
  parlourId: z.coerce.number().optional().nullable(),
  experience: z.coerce.number().min(0, "Experience must be >= 0"),
  isAvailableForHire: z.coerce.boolean().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  specialization: z.string().min(2),
});

type FormValues = z.infer<typeof formSchema>;

export function StaffFormDialog({
  open,
  onOpenChange,
  parlourId,
  initial,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parlourId: number;
  initial?: Staff | null;
  onSubmit: (values: FormValues) => void;
  isPending?: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parlourId,
      name: initial?.name ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      specialization: initial?.specialization ?? "Hair Artist",
      experience: initial?.experience ?? 3,
      bio: (initial as any)?.bio ?? "",
      profileImage: (initial as any)?.profileImage ?? "",
      isAvailableForHire: (initial as any)?.isAvailableForHire ?? true,
    },
  });

  React.useEffect(() => {
    form.reset({
      parlourId,
      name: initial?.name ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      specialization: initial?.specialization ?? "Hair Artist",
      experience: initial?.experience ?? 3,
      bio: (initial as any)?.bio ?? "",
      profileImage: (initial as any)?.profileImage ?? "",
      isAvailableForHire: (initial as any)?.isAvailableForHire ?? true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id, parlourId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit staff profile" : "Add staff"}</DialogTitle>
          <DialogDescription>
            Add specialization and contact details. Portfolio posts come in the next phase.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Aisha Khan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Input placeholder="Bridal makeup, Hair, Skin…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="staff@parlour.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 9xxxx xxxxx" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience (years)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="profileImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Short intro, signature style, awards…" className="min-h-[110px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-3 rounded-xl border bg-card/60 p-4">
              <div>
                <div className="font-semibold">Available for hire</div>
                <div className="text-xs text-muted-foreground">Show this staff member on hiring searches.</div>
              </div>
              <FormField
                control={form.control}
                name="isAvailableForHire"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="md:col-span-2 mt-2">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : initial ? "Save changes" : "Create staff"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
