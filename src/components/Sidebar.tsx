import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BarChart2, 
  Image as ImageIcon, 
  Users, 
  LogOut, 
  Menu,
  Edit,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUpdateUser } from "@/hooks/use-users";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";

const NAV_ITEMS: Array<{
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
}> = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Content", href: "/content", icon: ImageIcon },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "Usuários", href: "/settings", icon: Users, adminOnly: true },
];

// SCHEMA DE VALIDAÇÃO PARA EDIÇÃO DE PERFIL (instagramUsername não é editável aqui)
const profileFormSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
  name: z.string().min(1, "Nome é obrigatório"),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

// COMPONENTE DE MENU LATERAL - NAVEGAÇÃO PRINCIPAL COM LINKS E BOTÃO DE LOGOUT
export function Sidebar() {
  const location = useLocation();
  const { logout, user, isAdmin, isClient } = useAuth();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const updateMutation = useUpdateUser();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: user?.email || "",
      name: user?.name || "",
      password: "",
    },
  });

  // Atualiza valores do formulário quando o usuário muda
  useEffect(() => {
    if (user) {
      setValue("email", user.email);
      setValue("name", user.name);
      setValue("password", "");
    }
  }, [user, setValue]);

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    try {
      // Monta payload - Editar Perfil não altera instagramUsername (campo removido deste formulário)
      const updateData: Record<string, unknown> = {
        email: data.email,
        name: data.name,
      };
      if (data.password && data.password.trim()) {
        updateData.password = data.password;
      }
      
      await updateMutation.mutateAsync({
        id: user.id,
        data: updateData,
      });
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso!",
        variant: "success",
      });
      setShowPassword(false);
      setIsProfileDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao atualizar perfil",
        variant: "destructive",
      });
    }
  };

  const openProfileDialog = () => {
    if (user) {
      setValue("email", user.email);
      setValue("name", user.name);
      setValue("password", "");
      setIsProfileDialogOpen(true);
    }
  };

  // Detecta scroll para ocultar botão do menu no mobile
  useEffect(() => {
    const handleScroll = () => {
      // Verifica se está em mobile (largura <= 1024px que é o breakpoint lg)
      const isMobile = window.innerWidth < 1024;
      if (!isMobile) return;

      // Obtém a posição do scroll
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      
      // Oculta o botão quando o scroll for maior que 50px
      setIsScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Verifica inicialmente
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const NavContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center shadow-lg">
            <BarChart2 className="w-5 h-5 text-slate-900" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight">Insta Metrics</span>
        </div>
      </div>

      <div className="flex-1 px-4 space-y-2">
        {NAV_ITEMS.filter((item) => {
          // Filtra Usuários para clientes
          if (item.adminOnly && !isAdmin()) {
            return false;
          }
          return true;
        }).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="px-6 mt-auto">
        <div 
          className="bg-card border border-border/50 rounded-2xl p-4 mb-4 shadow-sm cursor-pointer hover:bg-muted/50 transition-colors group relative"
          onClick={openProfileDialog}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {isClient() && user?.instagramUsername 
                  ? user.instagramUsername 
                  : user?.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Edit className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0 ml-2" />
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800" 
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className={cn(
        "lg:hidden fixed top-4 left-4 z-50 transition-all duration-300",
        isScrolled ? "opacity-0 pointer-events-none -translate-y-2" : "opacity-100 pointer-events-auto translate-y-0"
      )}>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-11 w-11 shadow-lg hover:shadow-xl bg-background/95 backdrop-blur-sm border-2 border-slate-300 dark:border-slate-600 hover:border-primary hover:bg-primary/5 transition-all duration-200 active:scale-95"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-6 h-6 text-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-card/50 backdrop-blur-xl h-screen sticky top-0">
        <NavContent />
      </aside>

      {/* Dialog de Edição de Perfil */}
      <Dialog open={isProfileDialogOpen} onOpenChange={(open) => {
        setIsProfileDialogOpen(open);
        if (!open) setShowPassword(false);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize seus dados de acesso
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Nome Completo *</Label>
              <Input
                id="profile-name"
                autoComplete="off"
                className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email *</Label>
              <Input
                id="profile-email"
                type="email"
                autoComplete="off"
                className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-password">Nova Senha (deixe em branco para manter)</Label>
              <div className="relative">
                <Input
                  id="profile-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 pr-12"
                  {...register("password")}
                  placeholder="Deixe em branco para manter a senha atual"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsProfileDialogOpen(false);
                  setShowPassword(false);
                  reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
