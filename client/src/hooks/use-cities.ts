import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw result.error;
  }
  return result.data;
}

export function useCities() {
  return useQuery({
    queryKey: [api.cities.list.path],
    queryFn: async () => {
      const res = await fetch(api.cities.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cities");
      const json = await res.json();
      return parseWithLogging(api.cities.list.responses[200], json, "cities.list");
    },
  });
}

export function useCity(id: number) {
  return useQuery({
    queryKey: [api.cities.get.path, id],
    queryFn: async () => {
      const url = api.cities.get.path.replace(":id", String(id));
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch city");
      const json = await res.json();
      return parseWithLogging(api.cities.get.responses[200], json, "cities.get");
    },
  });
}
