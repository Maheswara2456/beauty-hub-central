import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useReviews(parlourId: number) {
  return useQuery({
    queryKey: ["/api/reviews", parlourId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?parlourId=${parlourId}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!parlourId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { parlourId: number; rating: number; comment?: string }) => {
      const res = await apiRequest("POST", "/api/reviews", data);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Failed to post review" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["/api/reviews", vars.parlourId] });
      qc.invalidateQueries({ queryKey: ["/api/parlours", vars.parlourId] });
      qc.invalidateQueries({ queryKey: ["/api/parlours"] });
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, parlourId }: { id: number; parlourId: number }) => {
      const res = await apiRequest("DELETE", `/api/reviews/${id}`, undefined);
      if (!res.ok) throw new Error("Failed to delete review");
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["/api/reviews", vars.parlourId] });
      qc.invalidateQueries({ queryKey: ["/api/parlours"] });
    },
  });
}
