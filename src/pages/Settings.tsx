import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/shared/routes";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/use-users";
import { useCompanies } from "@/hooks/use-companies";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, Eye, EyeOff, Instagram, Unplug } from "lucide-react";
import { getApiUrl, getAuthHeaders } from "@/lib/api";
import type { User } from "@/shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// VALIDAÇÃO DO PADRÃO DO INSTAGRAM USERNAME
const instagramUsernameSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true; // Permite vazio
      // Remove o @ se presente
      const username = val.replace(/^@/, "").trim();
      // Verifica se contém apenas caracteres permitidos (a-z, 0-9, ., _)
      const validPattern = /^[a-z0-9._]+$/;
      if (!validPattern.test(username)) return false;
      // Não pode começar ou terminar com ponto ou underscore
      if (/^[._]|[._]$/.test(username)) return false;
      // Não pode ter pontos ou underscores consecutivos
      if (/[._]{2,}/.test(username)) return false;
      // Deve ter pelo menos 1 caractere alfanumérico
      if (!/[a-z0-9]/.test(username)) return false;
      return true;
    },
    {
      message:
        "Nome de usuário do Instagram inválido. Use apenas letras minúsculas, números, ponto (.) e underscore (_). Não pode começar ou terminar com ponto ou underscore.",
    }
  );

// SCHEMAS DE VALIDAÇÃO
const userFormSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
  name: z.string().min(1, "Nome é obrigatório"),
  instagramUsername: instagramUsernameSchema,
  role: z.enum(["admin", "cliente"]),
  companyId: z.number().int().positive().optional().nullable(),
});

type UserFormData = z.infer<typeof userFormSchema>;

// DIALOG PARA CRIAR EMPRESA
function CreateCompanyDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/companies"), {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Falha ao criar empresa");
      }
      toast({ title: "Empresa criada", variant: "success" });
      setName("");
      setOpen(false);
      onSuccess();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Nova Empresa</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Empresa</DialogTitle>
          <DialogDescription>Digite o nome da empresa</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="company-name">Nome</Label>
            <Input
              id="company-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Minha Empresa"
              className="mt-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// COMPONENTE DE PÁGINA DE CONFIGURAÇÕES - GERENCIA USUÁRIOS (APENAS ADMIN) E INTEGRAÇÃO INSTAGRAM
export default function Settings() {
  const { user, isAdmin } = useAuth();
  const { data: users, isLoading } = useUsers();
  const { data: companies } = useCompanies(isAdmin());
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [isDisconnectingInstagram, setIsDisconnectingInstagram] = useState(false);
  const [showNoLinkedPageHelp, setShowNoLinkedPageHelp] = useState(false);

  // Trata callback OAuth Instagram (instagram_connected ou instagram_error)
  useEffect(() => {
    const connected = searchParams.get("instagram_connected");
    const error = searchParams.get("instagram_error");
    if (connected === "1") {
      toast({ title: "Instagram conectado!", description: "Sua conta foi vinculada com sucesso.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      setSearchParams({}, { replace: true });
    } else if (error) {
      if (error === "no_linked_page") setShowNoLinkedPageHelp(true);
      const msg =
        error === "instagram_token_expired"
          ? "Token expirado. Reconecte o Instagram."
          : error === "no_linked_page"
            ? "Nenhuma página com Instagram vinculada. Siga os passos abaixo para vincular."
            : decodeURIComponent(error);
      toast({ title: "Erro ao conectar Instagram", description: msg, variant: "destructive", duration: 8000 });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, toast, queryClient, setSearchParams]);

  const companyId = user?.companyId ?? null;
  const company = user?.company;
  const instagramConnected = company?.instagramBusinessAccountId != null;
  const instagramUsername = company?.instagramUsername;

  const handleConnectInstagram = async () => {
    if (!companyId) {
      toast({ title: "Erro", description: "Você precisa estar vinculado a uma empresa.", variant: "destructive" });
      return;
    }
    setIsConnectingInstagram(true);
    try {
      const url = `${getApiUrl("/api/auth/meta/start")}?companyId=${companyId}`;
      const res = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.message || "Erro ao iniciar conexão");
      }
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Falha ao conectar", variant: "destructive" });
    } finally {
      setIsConnectingInstagram(false);
    }
  };

  const handleDisconnectInstagram = async () => {
    if (!companyId) return;
    setIsDisconnectingInstagram(true);
    try {
      const res = await fetch(`${getApiUrl("/api/instagram/disconnect")}?companyId=${companyId}`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Falha ao desconectar");
      toast({ title: "Instagram desconectado", variant: "success" });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setIsDisconnectingInstagram(false);
    }
  };
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      instagramUsername: "",
      role: "cliente",
      companyId: null as number | null,
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      if (selectedUser) {
        // Editar - não permite alterar role
        await updateMutation.mutateAsync({
          id: selectedUser.id,
          data: {
            email: data.email,
            password: data.password || undefined,
            name: data.name,
            instagramUsername: data.instagramUsername || undefined,
            companyId: data.companyId ?? undefined,
          },
        });
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso!",
          variant: "success",
        });
        setShowEditPassword(false);
        setIsEditDialogOpen(false);
      } else {
        // Criar
        if (!data.password) {
          toast({
            title: "Erro",
            description: "Senha é obrigatória para criar usuário",
            variant: "destructive",
          });
          return;
        }
        await createMutation.mutateAsync({
          email: data.email,
          password: data.password,
          name: data.name,
          instagramUsername: data.instagramUsername || undefined,
          role: data.role,
          companyId: data.companyId && !Number.isNaN(data.companyId) ? data.companyId : undefined,
        });
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso!",
          variant: "success",
        });
        setShowCreatePassword(false);
        setIsCreateDialogOpen(false);
      }
      reset();
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar usuário",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (u: User) => {
    setSelectedUser(u);
    setValue("email", u.email);
    setValue("name", u.name);
    setValue("role", (u.role as "admin" | "cliente") || "cliente");
    setValue("instagramUsername", u.instagramUsername || "");
    setValue("password", "");
    setValue("companyId", (u as User & { companyId?: number }).companyId ?? null);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteMutation.mutateAsync(selectedUser.id);
      toast({
        title: "Sucesso",
        description: "Usuário deletado com sucesso!",
        variant: "success",
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Falha ao deletar usuário",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto lg:pt-6 md:pt-20 pt-20">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">Configurações</h1>
              <p className="text-muted-foreground mt-1">Integrações e gestão de usuários.</p>
            </div>
          </div>

          {/* Empresas - Apenas para Admin */}
          {isAdmin() && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Empresas</CardTitle>
                    <CardDescription>
                      Crie empresas para vincular usuários e conectar contas Instagram
                    </CardDescription>
                  </div>
                  <CreateCompanyDialog
                    onSuccess={() => {
                      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
                    }}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {companies?.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhuma empresa cadastrada. Crie a primeira acima.</p>
                ) : (
                  <ul className="text-sm space-y-1">
                    {companies?.map((c) => (
                      <li key={c.id} className="flex items-center gap-2">
                        <span className="font-medium">{c.name}</span>
                        {c.instagramUsername && (
                          <span className="text-muted-foreground">(@{c.instagramUsername})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          {/* Integração Instagram */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="w-5 h-5" />
                Integração Instagram
              </CardTitle>
              <CardDescription>
                Conecte sua conta Instagram Profissional (Business ou Creator) para exibir métricas e insights no dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!companyId ? (
                <p className="text-muted-foreground text-sm">
                  Você precisa estar vinculado a uma empresa para conectar o Instagram. Entre em contato com o administrador.
                </p>
              ) : instagramConnected ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">
                      Conectado como{" "}
                      <span className="text-primary">@{instagramUsername || "conta"}</span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sincronize os dados pelo botão no Dashboard para atualizar métricas e posts.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectInstagram}
                    disabled={isDisconnectingInstagram}
                    className="gap-2"
                  >
                    {isDisconnectingInstagram ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Unplug className="w-4 h-4" />
                    )}
                    Desconectar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {showNoLinkedPageHelp && (
                    <Alert variant="destructive" className="text-left">
                      <AlertTitle>Como vincular o Instagram à sua Página do Facebook</AlertTitle>
                      <AlertDescription>
                        <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                          <li>Crie ou use uma Página do Facebook (página pública, não perfil pessoal).</li>
                          <li>No app do Instagram: Configurações → Conta → Alternar para conta profissional e vincule à Página.</li>
                          <li>Ou no Facebook: Página → Configurações → Instagram → Conectar conta.</li>
                          <li>
                            <a
                              href="https://www.facebook.com/help/instagram/502981923235522"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline font-medium"
                            >
                              Ver instruções oficiais da Meta
                            </a>
                          </li>
                        </ol>
                      </AlertDescription>
                    </Alert>
                  )}
                  <p className="text-muted-foreground text-sm">
                    Requisitos: Instagram Profissional vinculado a uma Página do Facebook. Você precisa ser admin dessa página.
                  </p>
                  <Button
                    onClick={handleConnectInstagram}
                    disabled={isConnectingInstagram}
                    className="gap-2"
                  >
                    {isConnectingInstagram ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Instagram className="w-4 h-4" />
                    )}
                    Conectar Instagram
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gestão de Usuários - Apenas para Admin */}
          {isAdmin() && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestão de Usuários</CardTitle>
                    <CardDescription>
                      Crie, edite e gerencie usuários do sistema
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                      setIsCreateDialogOpen(open);
                      if (!open) setShowCreatePassword(false);
                    }}>
                    <DialogTrigger asChild>
                      <Button onClick={() => reset()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Usuário
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Criar Novo Usuário</DialogTitle>
                        <DialogDescription>
                          Preencha os dados para criar um novo usuário
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo *</Label>
                          <Input
                            id="name"
                            autoComplete="off"
                            className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            {...register("name")}
                            placeholder="Nome do usuário"
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive">{errors.name.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            autoComplete="off"
                            className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            {...register("email")}
                            placeholder="usuario@exemplo.com"
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive">{errors.email.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Senha *</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showCreatePassword ? "text" : "password"}
                              autoComplete="new-password"
                              className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 pr-12"
                              {...register("password")}
                              placeholder="Mínimo 6 caracteres"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCreatePassword(!showCreatePassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={showCreatePassword ? "Ocultar senha" : "Mostrar senha"}
                              title={showCreatePassword ? "Ocultar senha" : "Mostrar senha"}
                            >
                              {showCreatePassword ? (
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
                        <div className="space-y-2">
                          <Label htmlFor="instagramUsername">Nome de usuário (Instagram)</Label>
                          <Input
                            id="instagramUsername"
                            autoComplete="off"
                            className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            {...register("instagramUsername")}
                            placeholder="@username"
                            onChange={(e) => {
                              // Normaliza: remove @, converte para minúsculas, remove espaços
                              const normalized = e.target.value
                                .replace(/^@/, "")
                                .toLowerCase()
                                .replace(/\s+/g, "_")
                                .replace(/[^a-z0-9._]/g, "");
                              setValue("instagramUsername", normalized);
                            }}
                          />
                          {errors.instagramUsername && (
                            <p className="text-sm text-destructive">{errors.instagramUsername.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Perfil *</Label>
                          <Select
                            value={watch("role")}
                            onValueChange={(value) => setValue("role", value as "admin" | "cliente")}
                          >
                            <SelectTrigger className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20">
                              <SelectValue placeholder="Selecione o perfil" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="cliente">Cliente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {watch("role") === "cliente" && (
                          <div className="space-y-2">
                            <Label htmlFor="companyId">Empresa</Label>
                            <Select
                              value={watch("companyId") ? String(watch("companyId")) : "none"}
                              onValueChange={(v) => setValue("companyId", v === "none" ? null : parseInt(v, 10))}
                            >
                              <SelectTrigger className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20">
                                <SelectValue placeholder="Selecione a empresa" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Nenhuma</SelectItem>
                                {companies?.map((c) => (
                                  <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                              Clientes precisam de uma empresa para conectar o Instagram.
                            </p>
                          </div>
                        )}
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsCreateDialogOpen(false);
                              setShowCreatePassword(false);
                              reset();
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit" disabled={createMutation.isPending}>
                            {createMutation.isPending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Criando...
                              </>
                            ) : (
                              "Criar"
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-primary/10">
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Nome de usuário (Instagram)</TableHead>
                        <TableHead>Perfil</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users && users.length > 0 ? (
                        users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.name}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>
                              {u.instagramUsername ? (
                                <span className="text-primary font-medium">@{u.instagramUsername}</span>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  u.role === "admin"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {u.role === "admin" ? "Admin" : "Cliente"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(u)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteDialog(u)}
                                  disabled={u.id === user?.id}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            Nenhum usuário encontrado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {/* Dialog de Edição */}
          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setShowEditPassword(false);
              setSelectedUser(null);
            }
          }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogDescription>
                  Atualize os dados do usuário
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome Completo *</Label>
                  <Input
                    id="edit-name"
                    autoComplete="off"
                    className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
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
                  <Label htmlFor="edit-password">Nova Senha (deixe em branco para manter)</Label>
                  <div className="relative">
                    <Input
                      id="edit-password"
                      type={showEditPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20 pr-12"
                      {...register("password")}
                      placeholder="Deixe em branco para manter a senha atual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showEditPassword ? "Ocultar senha" : "Mostrar senha"}
                      title={showEditPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showEditPassword ? (
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
                {watch("role") === "cliente" && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-companyId">Empresa</Label>
                    <Select
                      value={watch("companyId") ? String(watch("companyId")) : "none"}
                      onValueChange={(v) => setValue("companyId", v === "none" ? null : parseInt(v, 10))}
                    >
                      <SelectTrigger className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma</SelectItem>
                        {companies?.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="edit-instagramUsername">Nome de usuário (Instagram)</Label>
                  <Input
                    id="edit-instagramUsername"
                    autoComplete="off"
                    className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    {...register("instagramUsername")}
                    placeholder="@username"
                    onChange={(e) => {
                      // Normaliza: remove @, converte para minúsculas, remove espaços
                      const normalized = e.target.value
                        .replace(/^@/, "")
                        .toLowerCase()
                        .replace(/\s+/g, "_")
                        .replace(/[^a-z0-9._]/g, "");
                      setValue("instagramUsername", normalized);
                    }}
                  />
                  {errors.instagramUsername && (
                    <p className="text-sm text-destructive">{errors.instagramUsername.message}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setShowEditPassword(false);
                      reset();
                      setSelectedUser(null);
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

          {/* Dialog de Confirmação de Exclusão */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja deletar o usuário{" "}
                  <strong>{selectedUser?.name}</strong>? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deletando...
                    </>
                  ) : (
                    "Deletar"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
}

