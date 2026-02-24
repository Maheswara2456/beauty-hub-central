import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateGalleryImageRequest } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useGallery(parlourId: number) {
  return useQuery({
    queryKey: [api.gallery.list.path, parlourId],
    queryFn: async () => {
      const validated = api.gallery.list.input.parse({ parlourId });
      const search = new URLSearchParams({ parlourId: String(validated.parlourId) });
      const url = `${api.gallery.list.path}?${search.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch gallery");
      return parseWithLogging(api.gallery.list.responses[200], await res.json(), "gallery.list");
    },
  });
}

export function useCreateGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGalleryImageRequest) => {
      const validated = api.gallery.create.input.parse(data);
      const res = await fetch(api.gallery.create.path, {
        method: api.gallery.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.gallery.create.responses[400], await res.json(), "gallery.create.400");
          throw new Error(err.message);
        }
        throw new Error("Failed to add image");
      }
      return parseWithLogging(api.gallery.create.responses[201], await res.json(), "gallery.create.201");
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: [api.gallery.list.path] });
      const parlourId = (data as any)?.parlourId;
      if (typeof parlourId === "number") qc.invalidateQueries({ queryKey: [api.gallery.list.path, parlourId] });
      qc.invalidateQueries({ queryKey: [api.parlours.get.path] });
    },
  });
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.gallery.delete.path, { id });
      const res = await fetch(url, { method: api.gallery.delete.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.gallery.delete.responses[404], await res.json(), "gallery.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to delete image");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.gallery.list.path] });
      qc.invalidateQueries({ queryKey: [api.parlours.get.path] });
    },
  });
}
