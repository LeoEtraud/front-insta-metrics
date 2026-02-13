import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type LoginRequest } from "../shared/routes";
import { User } from "../shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl, getAuthHeaders } from "@/lib/api";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

function useLoginMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await fetch(getApiUrl(api.auth.login.path), {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid credentials");
        throw new Error("Login failed");
      }
      return await res.json();
    },
    onSuccess: (data) => {
      // In a real app with JWT, we might store token in localStorage if not using HttpOnly cookies
      // For this implementation, we assume the backend sets an HttpOnly cookie or we handle the token
      // Storing in localStorage for demo purposes if backend sends it in body
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }
      
      queryClient.setQueryData([api.auth.me.path], data.user);
      toast({ title: "Welcome back!", description: "Successfully logged in." });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const loginMutation = useLoginMutation();

  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(getApiUrl(api.auth.me.path), {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      
      if (res.status === 401) {
        return null;
      }
      
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      
      return await res.json();
    },
    retry: false,
  });

  const logout = () => {
    localStorage.removeItem("accessToken");
    queryClient.setQueryData([api.auth.me.path], null);
    toast({ title: "Logged out", description: "See you next time!" });
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        loginMutation,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
