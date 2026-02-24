import * as React from "react";
import { z } from "zod";
import type { Service } from "@shared/schema";
import { insertServiceSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const formSchema = insertServiceSchema.extend({
  parlourId: z.coerce.number(),
  duration: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
  price: z.coerce.number().min(0, "Price must be >= 0"),
  category: z.string().min(1, "Category is required"),
  name: z.string().min(2, "Name is too short"),
});

type FormValues = z.infer<typeof formSchema>;

export function ServiceFormDialog({
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
  initial?: Service | null;
  onSubmit: (values: FormValues) => void;
  isPending?: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parlourId,
      name: initial?.name ?? "",
      description: (initial as any)?.description ?? "",
      price: initial?.price ? Number(initial.price as any) : 999,
      duration: initial?.duration ?? 45,
      category: initial?.category ?? "Hair",
    },
  });

  React.useEffect(() => {
    form.reset({
      parlourId,
      name: initial?.name ?? "",
      description: (initial as any)?.description ?? "",
      price: initial?.price ? Number(initial.price as any) : 999,
      duration: initial?.duration ?? 45,
      category: initial?.category ?? "Hair",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial?.id, parlourId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit service" : "Add a new service"}</DialogTitle>
          <DialogDescription>
            Keep it crisp: name, category, price and duration. Your clients will thank you.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => onSubmit(v))}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Service name</FormLabel>
                  <FormControl>
                    <Input placeholder="Keratin smoothening" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Hair / Skin / Bridal…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (mins)</FormLabel>
                  <FormControl>
                    <Input type="number" min={5} step={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={50} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What’s included? Prep, products, finish…" className="min-h-[110px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="md:col-span-2 mt-2">
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : initial ? "Save changes" : "Create service"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
