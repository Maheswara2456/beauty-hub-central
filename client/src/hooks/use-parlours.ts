import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateParlourRequest, UpdateParlourRequest } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useParlours(params?: z.infer<typeof api.parlours.list.input>) {
  const key = [api.parlours.list.path, params ?? {}] as const;
  return useQuery({
    queryKey: key as unknown as string[],
    queryFn: async () => {
      const search = new URLSearchParams();
      const p = params ?? {};
      if (p.cityId !== undefined) search.set("cityId", String(p.cityId));
      if (p.minRating !== undefined) search.set("minRating", String(p.minRating));
      if (p.maxPrice !== undefined) search.set("maxPrice", String(p.maxPrice));
      if (p.category) search.set("category", p.category);
      if (p.sortBy) search.set("sortBy", p.sortBy);

      const url = `${api.parlours.list.path}${search.toString() ? `?${search}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch parlours");
      const json = await res.json();
      return parseWithLogging(api.parlours.list.responses[200], json, "parlours.list");
    },
  });
}

export function useParlour(id: number) {
  return useQuery({
    queryKey: [api.parlours.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.parlours.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch parlour");
      const json = await res.json();
      return parseWithLogging(api.parlours.get.responses[200], json, "parlours.get");
    },
  });
}

export function useCreateParlour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateParlourRequest) => {
      const validated = api.parlours.create.input.parse(data);
      const res = await fetch(api.parlours.create.path, {
        method: api.parlours.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.parlours.create.responses[400], await res.json(), "parlours.create.400");
          throw new Error(err.message);
        }
        throw new Error("Failed to create parlour");
      }
      return parseWithLogging(api.parlours.create.responses[201], await res.json(), "parlours.create.201");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.parlours.list.path] });
    },
  });
}

export function useUpdateParlour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateParlourRequest }) => {
      const validated = api.parlours.update.input.parse(updates);
      const url = buildUrl(api.parlours.update.path, { id });
      const res = await fetch(url, {
        method: api.parlours.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.parlours.update.responses[400], await res.json(), "parlours.update.400");
          throw new Error(err.message);
        }
        if (res.status === 404) {
          const err = parseWithLogging(api.parlours.update.responses[404], await res.json(), "parlours.update.404");
          throw new Error(err.message);
        }
        throw new Error("Failed to update parlour");
      }
      return parseWithLogging(api.parlours.update.responses[200], await res.json(), "parlours.update.200");
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [api.parlours.list.path] });
      qc.invalidateQueries({ queryKey: [api.parlours.get.path, variables.id] });
    },
  });
}
