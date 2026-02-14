import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../shared/routes";
import { User, type LoginRequest } from "../shared/schema";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import { translateErrorMessage } from "@/lib/utils";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

// HOOK DE MUTAÇÃO PARA REALIZAR LOGIN - ENVIA CREDENCIAIS E GERENCIA TOKENS
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
        // Tenta obter a mensagem de erro do backend
        let errorMessage = "Credenciais inválidas";
        try {
          const errorData = await res.json();
          const backendMessage = errorData.message || errorMessage;
          // Traduz mensagens em inglês para português
          errorMessage = translateErrorMessage(backendMessage);
        } catch {
          // Se não conseguir parsear, usa mensagem padrão
          if (res.status === 401) {
            errorMessage = "Credenciais inválidas";
          } else {
            errorMessage = "Erro ao fazer login";
          }
        }
        throw new Error(errorMessage);
      }
      return await res.json();
    },
    onSuccess: (data) => {
      // In a real app with JWT, we might store token in localStorage if not using HttpOnly cookies
      // For this implementation, we assume the backend sets an HttpOnly cookie or we handle the token
      // Storing in localStorage for demo purposes if backend sends it in body
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        // Dispara evento para atualizar o estado do token
        window.dispatchEvent(new Event("tokenChanged"));
      }
      
      queryClient.setQueryData([api.auth.me.path], data.user);
      toast({ 
        title: "Bem-vindo de volta!", 
        description: "Login realizado com sucesso.",
        variant: "success"
      });
    },
    onError: (error: Error) => {
      // Verifica se é erro de conta OAuth sem senha
      const isOAuthError = error.message.includes("login social") || error.message.includes("Google") || error.message.includes("Microsoft");
      
      toast({
        title: "Erro no Login",
        description: error.message,
        variant: "destructive",
        duration: isOAuthError ? 8000 : 5000, // Mensagem mais longa para erros OAuth
      });
    },
  });
}

// PROVIDER DE CONTEXTO DE AUTENTICAÇÃO - GERENCIA ESTADO DO USUÁRIO E TOKENS
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estado reativo para verificar se há token
  const [hasToken, setHasToken] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("accessToken");
  });

  // Função para atualizar o estado do token
  const updateTokenState = () => {
    const token = localStorage.getItem("accessToken");
    setHasToken(!!token);
  };

  const loginMutation = useLoginMutation();
  
  // Atualiza o estado quando o login for bem-sucedido
  useEffect(() => {
    if (loginMutation.isSuccess) {
      updateTokenState();
    }
  }, [loginMutation.isSuccess]);

  // Observa mudanças no localStorage
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("accessToken");
      setHasToken(!!token);
    };

    // Verifica inicialmente
    checkToken();

    // Escuta mudanças no storage (de outros tabs/windows)
    window.addEventListener("storage", checkToken);

    // Escuta eventos customizados de mudança de token
    const handleTokenChange = () => checkToken();
    window.addEventListener("tokenChanged", handleTokenChange);

    return () => {
      window.removeEventListener("storage", checkToken);
      window.removeEventListener("tokenChanged", handleTokenChange);
    };
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      // Verifica novamente se há token antes de fazer a requisição
      const token = localStorage.getItem("accessToken");
      if (!token) {
        return null;
      }

      try {
        const res = await fetch(getApiUrl(api.auth.me.path), {
          headers: getAuthHeaders(),
          credentials: "include",
        });
        
        if (res.status === 401) {
          // Token inválido ou expirado - limpa o localStorage
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setHasToken(false);
          return null;
        }
        
        if (!res.ok) {
          throw new Error("Falha ao buscar usuário");
        }
        
        return await res.json();
      } catch (err) {
        // Erro de rede ou outro - não lança exceção para não poluir o console
        console.error("Erro ao buscar usuário:", err);
        return null;
      }
    },
    retry: false,
    // Só faz a query se houver token
    enabled: hasToken,
    // Não mostra erro no console se falhar
    throwOnError: false,
  });

  // REALIZA LOGOUT - REMOVE TOKENS E REDIRECIONA PARA PÁGINA DE LOGIN
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setHasToken(false);
    queryClient.setQueryData([api.auth.me.path], null);
    toast({ 
      title: "Logout realizado", 
      description: "Até logo!",
      variant: "destructive"
    });
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

// HOOK PARA ACESSAR CONTEXTO DE AUTENTICAÇÃO - RETORNA USUÁRIO, LOADING E FUNÇÕES DE LOGIN/LOGOUT
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
