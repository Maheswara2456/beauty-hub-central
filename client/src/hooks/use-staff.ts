import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateStaffRequest, UpdateStaffRequest } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useStaffList(params?: z.infer<typeof api.staff.list.input>) {
  const key = [api.staff.list.path, params ?? {}] as const;
  return useQuery({
    queryKey: key as unknown as string[],
    queryFn: async () => {
      const search = new URLSearchParams();
      const p = params ?? {};
      if (p.parlourId !== undefined) search.set("parlourId", String(p.parlourId));
      if (p.specialization) search.set("specialization", p.specialization);
      if (p.availableForHire !== undefined) search.set("availableForHire", String(p.availableForHire));
      const url = `${api.staff.list.path}${search.toString() ? `?${search}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch staff");
      return parseWithLogging(api.staff.list.responses[200], await res.json(), "staff.list");
    },
  });
}

export function useStaff(id: number) {
  return useQuery({
    queryKey: [api.staff.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.staff.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch staff member");
      return parseWithLogging(api.staff.get.responses[200], await res.json(), "staff.get");
    },
  });
}

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateStaffRequest) => {
      const validated = api.staff.create.input.parse(data);
      const res = await fetch(api.staff.create.path, {
        method: api.staff.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.staff.create.responses[400], await res.json(), "staff.create.400");
          throw new Error(err.message);
        }
        throw new Error("Failed to create staff");
      }
      return parseWithLogging(api.staff.create.responses[201], await res.json(), "staff.create.201");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.staff.list.path] });
      qc.invalidateQueries({ queryKey: [api.parlours.get.path] });
    },
  });
}

export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateStaffRequest }) => {
      const validated = api.staff.update.input.parse(updates);
      const url = buildUrl(api.staff.update.path, { id });
      const res = await fetch(url, {
        method: api.staff.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.staff.update.responses[400], await res.json(), "staff.update.400");
          throw new Error(err.message);
        }
        if (res.status === 404) {
          const err = parseWithLogging(api.staff.update.responses[404], await res.json(), "staff.update.404");
          throw new Error(err.message);
        }
        throw new Error("Failed to update staff");
      }
      return parseWithLogging(api.staff.update.responses[200], await res.json(), "staff.update.200");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.staff.list.path] });
      qc.invalidateQueries({ queryKey: [api.parlours.get.path] });
    },
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.staff.delete.path, { id });
      const res = await fetch(url, { method: api.staff.delete.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.staff.delete.responses[404], await res.json(), "staff.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to delete staff");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.staff.list.path] });
      qc.invalidateQueries({ queryKey: [api.parlours.get.path] });
    },
  });
}
