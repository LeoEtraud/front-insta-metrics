import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/use-users";
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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { USER_ROLES } from "@/shared/schema";
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
});

type UserFormData = z.infer<typeof userFormSchema>;

// COMPONENTE DE PÁGINA DE CONFIGURAÇÕES - GERENCIA USUÁRIOS (APENAS ADMIN)
export default function Settings() {
  const { user, isAdmin } = useAuth();
  const { data: users, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const { toast } = useToast();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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
            // role não é alterado na edição
          },
        });
        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso!",
          variant: "success",
        });
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
          instagramUsername: data.instagramUsername,
          role: data.role,
        });
        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso!",
          variant: "success",
        });
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

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setValue("email", user.email);
    setValue("name", user.name);
    setValue("instagramUsername", user.instagramUsername || "");
    setValue("password", "");
    // role não é editável no modal de edição
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

  const roleLabel = watch("role") === "admin" ? "Admin" : "Cliente";

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto lg:pt-6 md:pt-20 pt-20">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight">Usuários</h1>
              <p className="text-muted-foreground mt-1">Gerencie usuários do sistema.</p>
            </div>
          </div>

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
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                          <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            {...register("password")}
                            placeholder="Mínimo 6 caracteres"
                          />
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
                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsCreateDialogOpen(false);
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
                      <TableRow>
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
                                <span className="text-muted-foreground">@{u.instagramUsername}</span>
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
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                  <Input
                    id="edit-password"
                    type="password"
                    autoComplete="new-password"
                    className="border-2 border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    {...register("password")}
                    placeholder="Deixe em branco para manter a senha atual"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
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

