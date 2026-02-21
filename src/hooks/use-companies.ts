import { useQuery } from "@tanstack/react-query";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import type { Company } from "@/shared/schema";

export function useCompanies(enabled = true) {
  return useQuery({
    queryKey: ["/api/companies"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/companies"), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao buscar empresas");
      return (await res.json()) as Company[];
    },
    enabled,
  });
}
