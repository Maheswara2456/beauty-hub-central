import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useFavorites() {
  return useQuery({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites", { credentials: "include" });
      if (res.status === 401) return [];
      if (!res.ok) return [];
      return res.json();
    },
    staleTime: 30_000,
    retry: false,
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (parlourId: number) => {
      const res = await apiRequest("POST", "/api/favorites/toggle", { parlourId });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed" }));
        throw new Error(err.message);
      }
      return res.json() as Promise<{ favorited: boolean }>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });
}

export function useIsFavorited(parlourId: number) {
  const { data: favs } = useFavorites();
  if (!favs || !Array.isArray(favs)) return false;
  return favs.some((f: any) => f.parlourId === parlourId);
}
