import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateBeautyPostRequest } from "@shared/schema";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function usePosts(params?: z.infer<typeof api.posts.list.input>) {
  const key = [api.posts.list.path, params ?? {}] as const;
  return useQuery({
    queryKey: key as unknown as string[],
    queryFn: async () => {
      const search = new URLSearchParams();
      if (params?.staffId !== undefined) search.set("staffId", String(params.staffId));
      const url = `${api.posts.list.path}${search.toString() ? `?${search}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return parseWithLogging(api.posts.list.responses[200], await res.json(), "posts.list");
    },
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateBeautyPostRequest) => {
      const validated = api.posts.create.input.parse(data);
      const res = await fetch(api.posts.create.path, {
        method: api.posts.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const err = parseWithLogging(api.posts.create.responses[400], await res.json(), "posts.create.400");
          throw new Error(err.message);
        }
        throw new Error("Failed to create post");
      }
      return parseWithLogging(api.posts.create.responses[201], await res.json(), "posts.create.201");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.posts.list.path] });
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.posts.delete.path, { id });
      const res = await fetch(url, { method: api.posts.delete.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.posts.delete.responses[404], await res.json(), "posts.delete.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.posts.list.path] });
    },
  });
}

export function useLikePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.posts.like.path, { id });
      const res = await fetch(url, { method: api.posts.like.method, credentials: "include" });
      if (res.status === 404) {
        const err = parseWithLogging(api.posts.like.responses[404], await res.json(), "posts.like.404");
        throw new Error(err.message);
      }
      if (!res.ok) throw new Error("Failed to like post");
      return parseWithLogging(api.posts.like.responses[200], await res.json(), "posts.like.200");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [api.posts.list.path] });
    },
  });
}
