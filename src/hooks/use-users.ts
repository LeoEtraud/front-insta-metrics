import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../shared/routes";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import type { User } from "../shared/schema";
import { buildUrl } from "../shared/routes";

// HOOK PARA LISTAR TODOS OS USUÁRIOS
export function useUsers() {
  return useQuery({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await fetch(getApiUrl(api.users.list.path), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao buscar usuários");
      return api.users.list.responses[200].parse(await res.json());
    },
  });
}

// HOOK PARA BUSCAR USUÁRIO ESPECÍFICO
export function useUser(id: number) {
  return useQuery({
    queryKey: [api.users.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.users.get.path, { id: String(id) });
      const res = await fetch(getApiUrl(url), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao buscar usuário");
      return api.users.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// HOOK PARA CRIAR NOVO USUÁRIO
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      name: string;
      instagramUsername?: string;
      role: "admin" | "cliente";
    }) => {
      const res = await fetch(getApiUrl(api.users.create.path), {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Falha ao criar usuário");
      }
      return api.users.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
    },
  });
}

// HOOK PARA ATUALIZAR USUÁRIO
export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        email?: string;
        password?: string;
        name?: string;
        instagramUsername?: string;
        role?: "admin" | "cliente";
      };
    }) => {
      const url = buildUrl(api.users.update.path, { id: String(id) });
      const res = await fetch(getApiUrl(url), {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Falha ao atualizar usuário");
      }
      return api.users.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.users.get.path, variables.id] });
    },
  });
}

// HOOK PARA DELETAR USUÁRIO
export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.users.delete.path, { id: String(id) });
      const res = await fetch(getApiUrl(url), {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Falha ao deletar usuário");
      }
      return api.users.delete.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.list.path] });
    },
  });
}

