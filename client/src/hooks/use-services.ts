import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateServiceRequest, UpdateServiceRequest } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useServices(params?: z.infer<typeof api.services.list.input>) {
  const key = [api.services.list.path, params ?? {}] as const;
  return useQuery({
    queryKey: key as unknown as string[],
    queryFn: async () => {
      const search = new URLSearchParams();
      if (params?.parlourId !== undefined) search.set("parlourId", String(params.parlourId));
      const url = `${api.services.list.path}${search.toString() ? `?${search}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch services");
      return parseWithLogging(api.services.list.responses[200], await res.json(), "services.list");
    },
  });
}

export function useService(id: number) {
  return useQuery({
    queryKey: [api.services.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.services.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch service");
      return parseWithLogging(api.services.get.responses[200], await res.json(), "services.get");
    },
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateServiceRequest) => {
      const validated = api.services.create.input.parse(data);
      const res = await fetch(api.services.create.path, {
        method: api.services.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.services.create.responses[400], await res.json(), "services.create.400");
          throw new Error(err.message);
        }
        throw new Error("Failed to create service");
      }
      return parseWithLogging(api.services.create.responses[201], await res.json(), "services.create.201");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.services.list.path] });
      qc.invalidateQueries({ queryKey: [api.parlours.get.path] });
    },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateServiceRequest }) => {
      const validated = api.services.update.input.parse(updates);
      const url = buildUrl(api.services.update.path, { id });
      const res = await fetch(url, {
        method: api.services.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.services.update.responses[400], await res.json(), "services.update.400");
          throw new Error(err.message);
        }
        if (res.status === 404) {
          const err = parseWithLogging(api.services.update.responses[404], await res.json(), "services.update.404");
          throw new Error(err.message);
        }
        throw new Error("Failed to update service");
      }
      return parseWithLogging(api.services.update.responses[200], await res.json(), "services.update.200");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.services.list.path] });
      qc.invalidateQueries({ queryKey: [api.parlours.get.path] });
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.services.delete.path, { id });
      const res = await fetch(url, { method: api.services.delete.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.services.delete.responses[404], await res.json(), "services.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to delete service");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.services.list.path] });
      qc.invalidateQueries({ queryKey: [api.parlours.get.path] });
    },
  });
}
