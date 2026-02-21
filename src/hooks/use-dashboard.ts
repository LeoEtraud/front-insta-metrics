import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../shared/routes";
import { getApiUrl, getAuthHeaders } from "@/lib/api";

function buildUrl(path: string, companyId: number): string {
  const base = getApiUrl(path);
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}companyId=${companyId}`;
}

// HOOK PARA BUSCAR RESUMO DAS ESTATÍSTICAS DO DASHBOARD (SEGUIDORES, ALCANCE, POSTS, ENGAJAMENTO)
export function useDashboardSummary(companyId: number | null) {
  return useQuery({
    queryKey: [api.dashboard.summary.path, companyId],
    queryFn: async () => {
      if (companyId == null) throw new Error("companyId é obrigatório");
      const res = await fetch(buildUrl(api.dashboard.summary.path, companyId), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao buscar resumo");
      return api.dashboard.summary.responses[200].parse(await res.json());
    },
    enabled: companyId != null,
  });
}

// HOOK PARA BUSCAR TENDÊNCIAS DIÁRIAS (DADOS PARA GRÁFICOS)
export function useDashboardTrends(companyId: number | null) {
  return useQuery({
    queryKey: [api.dashboard.trends.path, companyId],
    queryFn: async () => {
      if (companyId == null) throw new Error("companyId é obrigatório");
      const res = await fetch(buildUrl(api.dashboard.trends.path, companyId), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao buscar tendências");
      return api.dashboard.trends.responses[200].parse(await res.json());
    },
    enabled: companyId != null,
  });
}

// HOOK PARA BUSCAR POSTS DO INSTAGRAM
export function useInstagramPosts(companyId: number | null) {
  return useQuery({
    queryKey: [api.instagram.posts.path, companyId],
    queryFn: async () => {
      if (companyId == null) throw new Error("companyId é obrigatório");
      const res = await fetch(buildUrl(api.instagram.posts.path, companyId), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao buscar posts");
      return api.instagram.posts.responses[200].parse(await res.json());
    },
    enabled: companyId != null,
  });
}

// HOOK PARA SINCRONIZAR DADOS DO INSTAGRAM MANUALMENTE - INVALIDA QUERIES PARA ATUALIZAR DADOS
export function useSyncInstagram(companyId: number | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (companyId == null) throw new Error("companyId é obrigatório");
      const res = await fetch(buildUrl(api.instagram.sync.path, companyId), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao sincronizar dados");
      return await res.json();
    },
    onSuccess: () => {
      if (companyId != null) {
        queryClient.invalidateQueries({ queryKey: [api.dashboard.summary.path, companyId] });
        queryClient.invalidateQueries({ queryKey: [api.dashboard.trends.path, companyId] });
        queryClient.invalidateQueries({ queryKey: [api.instagram.posts.path, companyId] });
      }
    },
  });
}
