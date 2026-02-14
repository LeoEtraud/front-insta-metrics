import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginRequest } from "../shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  TrendingUp,
  BarChart3,
  Users,
  Zap,
  BarChart2
} from "lucide-react";
import { motion } from "framer-motion";
import { getApiUrl } from "@/lib/api";

export default function Login() {
  const { loginMutation, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Verifica se há erro na URL (vindo do OAuth)
  useEffect(() => {
    const error = searchParams.get("error");
    const errorMessage = searchParams.get("message");
    
    if (error === "oauth_failed" && errorMessage) {
      const decodedMessage = decodeURIComponent(errorMessage);
      toast({
        title: "Erro no login social",
        description: decodedMessage,
        variant: "destructive",
        duration: 8000,
      });
      
      // Remove os parâmetros da URL
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, toast]);

  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginRequest) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate("/dashboard", { replace: true });
      },
    });
  };

  return (
    <div className="min-h-screen w-full flex overflow-hidden bg-background">
      {/* Lado Esquerdo - Área Visual (65%) */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-[65%] relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden select-none"
      >
        {/* Overlay com gradiente escuro */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 z-10" />
        
        {/* Elementos decorativos animados */}
        <div className="absolute inset-0 z-0">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-20 left-20 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
          />
        </div>

        {/* Ilustração SVG de métricas/dashboard */}
        <div className="absolute inset-0 z-5 flex items-center justify-center opacity-20">
          <svg
            width="600"
            height="600"
            viewBox="0 0 600 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-yellow-400"
          >
            {/* Gráfico de barras */}
            <rect x="100" y="300" width="60" height="150" fill="currentColor" opacity="0.6" />
            <rect x="180" y="250" width="60" height="200" fill="currentColor" opacity="0.7" />
            <rect x="260" y="200" width="60" height="250" fill="currentColor" opacity="0.8" />
            <rect x="340" y="150" width="60" height="300" fill="currentColor" opacity="0.9" />
            <rect x="420" y="180" width="60" height="270" fill="currentColor" opacity="0.7" />
            
            {/* Linha de tendência */}
            <path
              d="M 100 400 L 180 350 L 260 300 L 340 250 L 420 280"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              opacity="0.5"
            />
            
            {/* Círculos de métricas */}
            <circle cx="150" cy="150" r="40" fill="currentColor" opacity="0.3" />
            <circle cx="450" cy="150" r="40" fill="currentColor" opacity="0.3" />
            <circle cx="300" cy="100" r="40" fill="currentColor" opacity="0.3" />
          </svg>
        </div>

        {/* Conteúdo textual */}
        <div className="relative z-20 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart2 className="w-7 h-7 text-slate-900" />
              </div>
              <h1 className="text-3xl font-bold font-['Poppins'] text-white">Insta Metrics</h1>
            </div>
            
            <h2 className="text-5xl font-bold font-['Poppins'] leading-tight text-white">
              Transforme seus dados em
              <span className="text-yellow-400 block mt-2">crescimento digital</span>
            </h2>
            
            <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
              Analise métricas, acompanhe o desempenho e tome decisões baseadas em dados para impulsionar sua presença no Instagram.
            </p>

            {/* Features destacadas */}
            <div className="grid grid-cols-2 gap-6 mt-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold">Análise em Tempo Real</p>
                  <p className="text-sm text-slate-400">Métricas atualizadas</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold">Dashboards Intuitivos</p>
                  <p className="text-sm text-slate-400">Visualizações claras</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold">Engajamento</p>
                  <p className="text-sm text-slate-400">Acompanhe seguidores</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-yellow-400/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold">Performance</p>
                  <p className="text-sm text-slate-400">Otimize resultados</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Lado Direito - Formulário (35%) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-[35%] flex items-center justify-center p-6 lg:p-12 bg-background"
      >
        <div className="w-full max-w-md space-y-8">
          {/* Logo e nome do sistema - Tablet e Mobile */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex lg:hidden items-center justify-center gap-3 mb-6"
          >
            <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart2 className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold font-['Poppins']">Insta Metrics</h1>
          </motion.div>

          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block text-center space-y-3 mb-2"
          >
            <h2 className="text-3xl font-bold font-['Poppins'] text-foreground tracking-tight">
              Acesse sua conta
            </h2>
            <p className="text-base text-muted-foreground/90 leading-relaxed max-w-sm mx-auto font-normal">
              Entre com suas credenciais para acessar seu dashboard de análises
            </p>
          </motion.div>

          {/* Card do formulário */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/70 dark:to-slate-900/70 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50"
          >
            {/* Formulário */}
            <motion.form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
            {/* Campo Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  maxLength={100}
                  className="h-12 pl-10 pr-4 bg-muted/30 border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  aria-invalid={errors.email ? "true" : "false"}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  maxLength={50}
                  className="h-12 pl-10 pr-12 bg-muted/30 border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive mt-1" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Checkbox Lembrar de mim */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-black dark:border-white"
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal cursor-pointer text-muted-foreground"
              >
                Lembrar de mim
              </Label>
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              className="w-full h-12 font-semibold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mb-8"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            {/* Divisor */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/70 dark:to-slate-900/70 px-2 text-muted-foreground">Ou continue com</span>
              </div>
            </div>

            {/* Botões de Login Social */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 !border-transparent bg-white/90 dark:bg-slate-700/90 shadow-md hover:!border-black dark:hover:!border-white hover:bg-white dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out"
                onClick={() => {
                  window.location.href = getApiUrl("/api/auth/google");
                }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 !border-transparent bg-white/90 dark:bg-slate-700/90 shadow-md hover:!border-black dark:hover:!border-white hover:bg-white dark:hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ease-in-out"
                onClick={() => {
                  window.location.href = getApiUrl("/api/auth/microsoft");
                }}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M11.4 24H0V12.6h11.4V24z" />
                  <path fill="#00A4EF" d="M24 24H12.6V12.6H24V24z" />
                  <path fill="#7FBA00" d="M11.4 11.4H0V0h11.4v11.4z" />
                  <path fill="#FFB900" d="M24 11.4H12.6V0H24v11.4z" />
                </svg>
                Microsoft
              </Button>
            </div>

            </motion.form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
