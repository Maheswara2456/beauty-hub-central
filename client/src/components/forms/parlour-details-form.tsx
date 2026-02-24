import * as React from "react";
import { z } from "zod";
import type { Parlour } from "@shared/schema";
import { insertParlourSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const formSchema = insertParlourSchema.extend({
  cityId: z.coerce.number(),
  name: z.string().min(2),
  address: z.string().min(6),
  phone: z.string().min(8),
  email: z.string().email(),
  description: z.string().min(10),
  ownerCode: z.string().min(2),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export function ParlourDetailsForm({
  parlour,
  onSubmit,
  isPending,
}: {
  parlour: Parlour;
  onSubmit: (updates: Partial<FormValues>) => void;
  isPending?: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cityId: (parlour as any)?.cityId ?? 1,
      name: parlour.name ?? "",
      address: (parlour as any)?.address ?? "",
      phone: (parlour as any)?.phone ?? "",
      email: (parlour as any)?.email ?? "",
      description: (parlour as any)?.description ?? "",
      ownerCode: (parlour as any)?.ownerCode ?? "",
      imageUrl: (parlour as any)?.imageUrl ?? "",
    },
  });

  React.useEffect(() => {
    form.reset({
      cityId: (parlour as any)?.cityId ?? 1,
      name: parlour.name ?? "",
      address: (parlour as any)?.address ?? "",
      phone: (parlour as any)?.phone ?? "",
      email: (parlour as any)?.email ?? "",
      description: (parlour as any)?.description ?? "",
      ownerCode: (parlour as any)?.ownerCode ?? "",
      imageUrl: (parlour as any)?.imageUrl ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parlour?.id]);

  const submit = (values: FormValues) => {
    const updates: Partial<FormValues> = {
      name: values.name,
      address: values.address,
      phone: values.phone,
      email: values.email,
      description: values.description,
      imageUrl: values.imageUrl ? values.imageUrl : null,
    } as any;

    // ownerCode and cityId are typically immutable for owners; keep them in UI but don't update unless needed.
    onSubmit(updates);
  };

  return (
    <Card className="glass noise-overlay p-5 md:p-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <div className="text-lg font-semibold">Parlour details</div>
          <div className="text-xs text-muted-foreground">Polish your public profile—this drives bookings.</div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submit)} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parlour name</FormLabel>
                <FormControl>
                  <Input placeholder="VelvetGlow Studio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+91…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="hello@studio.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover image URL (optional)</FormLabel>
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, area, landmark…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea className="min-h-[130px]" placeholder="Your signature vibe, hygiene, products…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
