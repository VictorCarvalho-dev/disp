"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, User, Edit, Trash2, Loader2 } from 'lucide-react';
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
import { deleteUser } from "@/app/_server-actions/users";
import { EditUser } from "./editUser";

export function UsersTable({ users, onUserUpdated, isLoading = false }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    setIsDeleting(true);
    try {
      await deleteUser(selectedUser._id);
    } catch (error) {
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };


  return (
    <div className="space-y-4">
      <div className="w-full overflow-hidden rounded-lg border">
        <div className="relative w-full overflow-x-auto">
          <Table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow className="border-b border-slate-200 dark:border-slate-700">
                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Nome
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  E-mail
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Permissão
                </TableHead>
                <TableHead className="relative w-10 px-6 py-3">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 px-6 py-4 text-center">
                  <div className="flex flex-col items-center justify-center py-6">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando usuários...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 px-6 py-4 text-center">
                  <div className="flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-400">
                    <User className="mb-2 h-12 w-12 opacity-50" />
                    <p className="text-sm font-medium">Nenhum usuário encontrado</p>
                    <p className="text-xs">Adicione um novo usuário para começar</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <TableCell className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {user.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {user.email}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4">
                    {user.permission === 'admin' ? (
                      <Badge className="bg-blue-600 hover:bg-blue-700">Administrador</Badge>
                    ) : (
                      <Badge variant="outline" className="border-slate-200 dark:border-slate-600">Usuário</Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedUser(user);
                            setEditDialogOpen(true);
                          }}
                          className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 focus:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteClick(user);
                          }}
                          className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 dark:focus:bg-red-900/30"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>

    {selectedUser && (
        <EditUser
          user={selectedUser}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSuccess={() => {
            onUserUpdated?.();
            setEditDialogOpen(false);
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{selectedUser?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
