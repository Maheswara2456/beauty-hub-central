import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateBookingRequest, UpdateBookingRequest } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useBookings(params?: z.infer<typeof api.bookings.list.input>) {
  const key = [api.bookings.list.path, params ?? {}] as const;
  return useQuery({
    queryKey: key as unknown as string[],
    queryFn: async () => {
      const search = new URLSearchParams();
      const p = params ?? {};
      if (p.parlourId !== undefined) search.set("parlourId", String(p.parlourId));
      if (p.customerEmail) search.set("customerEmail", p.customerEmail);
      if (p.status) search.set("status", p.status);

      const url = `${api.bookings.list.path}${search.toString() ? `?${search}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return parseWithLogging(api.bookings.list.responses[200], await res.json(), "bookings.list");
    },
  });
}

export function useBooking(id: number) {
  return useQuery({
    queryKey: [api.bookings.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.bookings.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch booking");
      return parseWithLogging(api.bookings.get.responses[200], await res.json(), "bookings.get");
    },
  });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBookingRequest) => {
      const validated = api.bookings.create.input.parse(data);
      const res = await fetch(api.bookings.create.path, {
        method: api.bookings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.bookings.create.responses[400], await res.json(), "bookings.create.400");
          throw new Error(err.message);
        }
        throw new Error("Failed to create booking");
      }
      return parseWithLogging(api.bookings.create.responses[201], await res.json(), "bookings.create.201");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.bookings.list.path] });
      qc.invalidateQueries({ queryKey: [api.parlours.get.path] });
    },
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateBookingRequest }) => {
      const validated = api.bookings.update.input.parse(updates);
      const url = buildUrl(api.bookings.update.path, { id });
      const res = await fetch(url, {
        method: api.bookings.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.bookings.update.responses[400], await res.json(), "bookings.update.400");
          throw new Error(err.message);
        }
        if (res.status === 404) {
          const err = parseWithLogging(api.bookings.update.responses[404], await res.json(), "bookings.update.404");
          throw new Error(err.message);
        }
        throw new Error("Failed to update booking");
      }
      return parseWithLogging(api.bookings.update.responses[200], await res.json(), "bookings.update.200");
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [api.bookings.list.path] });
      qc.invalidateQueries({ queryKey: [api.bookings.get.path, variables.id] });
    },
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.bookings.delete.path, { id });
      const res = await fetch(url, { method: api.bookings.delete.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.bookings.delete.responses[404], await res.json(), "bookings.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to delete booking");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.bookings.list.path] });
    },
  });
}
