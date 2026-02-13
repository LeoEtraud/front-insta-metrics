import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/shared/routes";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = searchParams.get("token");
    const refreshToken = searchParams.get("refreshToken");
    const userParam = searchParams.get("user");
    const error = searchParams.get("error");

    console.log("AuthCallback - Parâmetros recebidos:", {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      hasUser: !!userParam,
      error,
    });

    if (error) {
      const errorMessage = searchParams.get("message");
      const decodedMessage = errorMessage ? decodeURIComponent(errorMessage) : null;
      
      console.error("Erro OAuth:", error, decodedMessage);
      
      toast({
        title: "Erro na autenticação",
        description: decodedMessage || "Falha ao fazer login com o provedor OAuth. Verifique se você já possui uma conta cadastrada.",
        variant: "destructive",
        duration: 8000,
      });
      
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        console.log("AuthCallback - Processando autenticação:", {
          userId: user.id,
          email: user.email,
        });
        
        // Salva tokens PRIMEIRO
        localStorage.setItem("accessToken", token);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        // Dispara evento para atualizar o estado do token
        window.dispatchEvent(new Event("tokenChanged"));

        console.log("AuthCallback - Tokens salvos no localStorage");

        // Atualiza o cache do React Query com o usuário
        queryClient.setQueryData([api.auth.me.path], user);
        
        // Força uma refetch para garantir que o backend valide o token
        queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
        
        console.log("AuthCallback - Cache atualizado, aguardando...");

        toast({
          title: "Login realizado!",
          description: "Autenticação via OAuth concluída com sucesso.",
          variant: "success",
        });

        // Aguarda um pouco para garantir que tudo foi processado
        // Usa window.location.href para forçar reload completo
        setTimeout(() => {
          console.log("AuthCallback - Redirecionando para dashboard...");
          window.location.href = "/dashboard";
        }, 1500);
      } catch (err) {
        console.error("Erro ao processar callback:", err);
        toast({
          title: "Erro",
          description: "Falha ao processar autenticação",
          variant: "destructive",
        });
        navigate("/login", { replace: true });
      }
    } else {
      console.error("AuthCallback - Dados incompletos:", {
        token: !!token,
        userParam: !!userParam,
      });
      toast({
        title: "Erro",
        description: "Dados de autenticação incompletos. Tente novamente.",
        variant: "destructive",
      });
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    }
  }, [searchParams, navigate, toast, queryClient]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Processando autenticação...</p>
      </div>
    </div>
  );
}

