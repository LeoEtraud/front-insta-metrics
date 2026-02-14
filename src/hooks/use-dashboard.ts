import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../shared/routes";
import { getApiUrl, getAuthHeaders } from "@/lib/api";

// Hook to fetch dashboard summary stats
export function useDashboardSummary() {
  return useQuery({
    queryKey: [api.dashboard.summary.path],
    queryFn: async () => {
      const res = await fetch(getApiUrl(api.dashboard.summary.path), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao buscar resumo");
      return api.dashboard.summary.responses[200].parse(await res.json());
    },
  });
}

// Hook to fetch daily trends (chart data)
export function useDashboardTrends() {
  return useQuery({
    queryKey: [api.dashboard.trends.path],
    queryFn: async () => {
      const res = await fetch(getApiUrl(api.dashboard.trends.path), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao buscar tendências");
      return api.dashboard.trends.responses[200].parse(await res.json());
    },
  });
}

// Hook to fetch instagram posts
export function useInstagramPosts() {
  return useQuery({
    queryKey: [api.instagram.posts.path],
    queryFn: async () => {
      const res = await fetch(getApiUrl(api.instagram.posts.path), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao buscar posts");
      return api.instagram.posts.responses[200].parse(await res.json());
    },
  });
}

// Hook to sync data manually
export function useSyncInstagram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(getApiUrl(api.instagram.sync.path), {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao sincronizar dados");
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate all dashboard queries to refresh data
      queryClient.invalidateQueries({ queryKey: [api.dashboard.summary.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.trends.path] });
      queryClient.invalidateQueries({ queryKey: [api.instagram.posts.path] });
    },
  });
}
