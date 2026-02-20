import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { 
  Loader2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../shared/routes";
import { getApiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { translateErrorMessage } from "@/lib/utils";

const emailSchema = z.object({
  email: z.string().email("Email inválido"),
});

const codeSchema = z.object({
  code: z.string().length(6, "Código deve ter 6 dígitos").regex(/^\d+$/, "Código deve conter apenas números"),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type EmailForm = z.infer<typeof emailSchema>;
type CodeForm = z.infer<typeof codeSchema>;
type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

type Step = "email" | "code" | "reset";

// COMPONENTE DE PÁGINA DE RECUPERAÇÃO DE SENHA - GERENCIA FLUXO DE REDEFINIÇÃO COM CÓDIGO DE 6 DÍGITOS
export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Formulário de email
  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
  });

  // Formulário de código
  const codeForm = useForm<CodeForm>({
    resolver: zodResolver(codeSchema),
  });

  // Formulário de redefinição de senha
  const resetForm = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleSendCode = async (data: EmailForm) => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl(api.auth.forgotPassword.path), {
        method: api.auth.forgotPassword.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        const errorMessage = error.message || "Erro ao enviar código";
        throw new Error(translateErrorMessage(errorMessage));
      }

      setEmail(data.email);
      setStep("code");
      toast({
        title: "Código enviado!",
        description: "Verifique seu email e insira o código de 6 dígitos.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: translateErrorMessage(error.message || "Falha ao enviar código"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (data: CodeForm) => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl(api.auth.verifyResetCode.path), {
        method: api.auth.verifyResetCode.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: data.code }),
      });

      if (!res.ok) {
        const error = await res.json();
        const errorMessage = error.message || "Código inválido";
        throw new Error(translateErrorMessage(errorMessage));
      }

      setCode(data.code);
      setStep("reset");
      toast({
        title: "Código válido!",
        description: "Agora você pode redefinir sua senha.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: translateErrorMessage(error.message || "Código inválido ou expirado"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetPasswordForm) => {
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl(api.auth.resetPassword.path), {
        method: api.auth.resetPassword.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          newPassword: data.newPassword,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        const errorMessage = error.message || "Erro ao redefinir senha";
        throw new Error(translateErrorMessage(errorMessage));
      }

      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso. Faça login para continuar.",
        variant: "success",
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: translateErrorMessage(error.message || "Falha ao redefinir senha"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 z-10" />
        
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
        </div>

        <div className="relative z-20 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/25 flex-shrink-0 ring-2 ring-amber-400/30">
                <BarChart2 className="w-8 h-8 text-slate-900" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-['Poppins'] text-white tracking-tight">Insta Metrics</h1>
                <div className="h-0.5 w-16 bg-amber-400/60 mt-1 rounded-full" />
              </div>
            </div>
            
            <h2 className="text-5xl font-bold font-['Poppins'] leading-tight text-white">
              Recuperação de
              <span className="text-yellow-400 block mt-2">Senha</span>
            </h2>
            
            <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
              Siga os passos para recuperar sua senha. Um código de verificação será enviado para seu email.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Lado Direito - Formulário (35%) */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-[35%] flex items-center justify-center p-6 lg:p-12 bg-background overflow-y-auto"
      >
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex lg:hidden items-center justify-center gap-4 mb-12 md:mb-16">
              <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-400/25 flex-shrink-0 ring-2 ring-amber-400/30">
                <BarChart2 className="w-8 h-8 text-slate-900" />
              </div>
              <div className="flex flex-col items-center">
                <h1 className="text-2xl font-bold font-['Poppins'] tracking-tight">Insta Metrics</h1>
                <div className="h-0.5 w-12 bg-amber-400/60 mt-1 rounded-full" />
              </div>
            </div>
            <h2 className="text-2xl font-bold font-['Poppins'] mb-2">Recuperar Senha</h2>
            <p className="text-sm text-muted-foreground">
              {step === "email" && "Digite seu email para receber o código de verificação"}
              {step === "code" && "Digite o código de 6 dígitos enviado para seu email"}
              {step === "reset" && "Digite sua nova senha"}
            </p>
          </div>

          {/* Card do formulário */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800/70 dark:to-slate-900/70 rounded-2xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 mt-12 md:mt-16 lg:mt-8"
          >
            {/* Indicador de progresso */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className={`h-2 w-16 rounded-full ${step === "email" ? "bg-primary" : "bg-primary/30"}`} />
              <div className={`h-2 w-16 rounded-full ${step === "code" ? "bg-primary" : step === "reset" ? "bg-primary/30" : "bg-muted"}`} />
              <div className={`h-2 w-16 rounded-full ${step === "reset" ? "bg-primary" : "bg-muted"}`} />
            </div>

            {/* Formulários */}
            <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={emailForm.handleSubmit(handleSendCode)}
                className="space-y-5"
              >
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
                      className="h-12 pl-10 pr-4 bg-muted/30 border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      {...emailForm.register("email")}
                    />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-semibold text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Código"
                  )}
                </Button>

                <div className="text-center mt-10 md:mt-12">
                  <Link
                    to="/login"
                    className="text-sm text-primary hover:underline flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para login
                  </Link>
                </div>
              </motion.form>
            )}

            {step === "code" && (
              <motion.form
                key="code"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={codeForm.handleSubmit(handleVerifyCode)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium">
                    Código de Verificação
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    inputMode="numeric"
                    className="h-12 text-center text-2xl font-mono tracking-widest bg-muted/30 border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    {...codeForm.register("code", {
                      onChange: (e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        codeForm.setValue("code", value);
                      },
                    })}
                  />
                  {codeForm.formState.errors.code && (
                    <p className="text-sm text-destructive mt-1">
                      {codeForm.formState.errors.code.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    Código enviado para: {email}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-semibold text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verificando...
                    </>
                  ) : (
                    "Verificar Código"
                  )}
                </Button>

                <div className="text-center space-y-6">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-sm text-primary hover:underline"
                  >
                    Reenviar código
                  </button>
                  <div className="mt-10 md:mt-12">
                    <Link
                      to="/login"
                      className="text-sm text-muted-foreground hover:underline flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar para login
                    </Link>
                  </div>
                </div>
              </motion.form>
            )}

            {step === "reset" && (
              <motion.form
                key="reset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={resetForm.handleSubmit(handleResetPassword)}
                className="space-y-5"
              >
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Código verificado com sucesso!
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium">
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-12 pl-10 pr-12 bg-muted/30 border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      {...resetForm.register("newPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {resetForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {resetForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirmar Nova Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-12 pl-10 pr-12 bg-muted/30 border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                      {...resetForm.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 font-semibold text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    "Redefinir Senha"
                  )}
                </Button>

                <div className="text-center mt-10 md:mt-12">
                  <Link
                    to="/login"
                    className="text-sm text-muted-foreground hover:underline flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar para login
                  </Link>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

