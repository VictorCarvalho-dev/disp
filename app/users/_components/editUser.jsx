"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { updateUser } from "@/app/_server-actions/users";
import { toast } from "sonner";

const userSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Por favor, insira um e-mail válido",
  }),
  password: z.string().optional(),
  permission: z.string({
    required_error: "Por favor, selecione um nível de permissão",
  }),
});

export function EditUser({ user, open, onOpenChange, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [changePassword, setChangePassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      permission: "user",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        password: "",
        permission: user.permission || "user",
      });
      setChangePassword(false);
    }
  }, [user, form]);

  const onSubmit = async (values) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const dataToUpdate = {
        name: values.name,
        email: values.email,
        permission: values.permission,
      };

      if (changePassword && values.password) {
        dataToUpdate.password = values.password;
      }

      await updateUser(user._id, dataToUpdate);
      toast.success("Usuário atualizado com sucesso!");
      onSuccess?.();
      onOpenChange?.(false);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error("Erro ao atualizar usuário. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Editar Usuário</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange?.(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="changePassword" 
                  checked={changePassword}
                  onCheckedChange={(checked) => setChangePassword(!!checked)}
                />
                <label
                  htmlFor="changePassword"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Alterar senha
                </label>
              </div>
              {changePassword && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Nova senha" 
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription>
                        Deixe em branco para manter a senha atual
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="permission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Permissão</FormLabel>
                  <select
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  >
                    <option value="user">Usuário</option>
                    <option value="admin">Administrador</option>
                  </select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange?.(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
