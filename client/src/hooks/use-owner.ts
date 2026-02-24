import { useMutation } from "@tanstack/react-query";
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

export type OwnerSession = z.infer<typeof api.owner.login.responses[200]>;

const LS_KEY = "beauty.ownerSession";

export function getOwnerSession(): OwnerSession | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return api.owner.login.responses[200].parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function setOwnerSession(session: OwnerSession | null) {
  if (!session) localStorage.removeItem(LS_KEY);
  else localStorage.setItem(LS_KEY, JSON.stringify(session));
}

export function useOwnerLogin() {
  return useMutation({
    mutationFn: async (ownerCode: string) => {
      const validated = api.owner.login.input.parse({ ownerCode });
      const res = await fetch(api.owner.login.path, {
        method: api.owner.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          const err = parseWithLogging(api.owner.login.responses[401], await res.json(), "owner.login.401");
          throw new Error(err.message);
        }
        throw new Error("Failed to login");
      }

      const session = parseWithLogging(api.owner.login.responses[200], await res.json(), "owner.login.200");
      setOwnerSession(session);
      return session;
    },
  });
}

export function ownerLogout() {
  setOwnerSession(null);
}
