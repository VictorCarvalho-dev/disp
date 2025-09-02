"use client";

import { useState } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2, Edit2, Loader2, XCircle } from 'lucide-react';
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

export function HeaterTable({ heaters, onCancelHeater, isLoading = false }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHeater, setSelectedHeater] = useState(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const handleCancelClick = (heater) => {
    setSelectedHeater(heater);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (heater) => {
    // Aqui você pode implementar a lógica para editar o aquecimento
    // Por exemplo, abrir um modal de edição com os dados atuais
    toast.info("Funcionalidade de edição em desenvolvimento");
  };

  const handleDeleteClick = async (heater) => {
    if (window.confirm(`Tem certeza que deseja excluir permanentemente o aquecimento ${heater.name}?`)) {
      try {
        await cancelHeater(heater._id);
        onHeaterCanceled?.();
        toast.success("Aquecimento excluído com sucesso!");
      } catch (error) {
        console.error("Erro ao excluir aquecimento:", error);
        toast.error("Erro ao excluir aquecimento");
      }
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedHeater) return;
    setIsCanceling(true);
    try {
      await onCancelHeater(selectedHeater._id);
    } finally {
      setIsCanceling(false);
      setDeleteDialogOpen(false);
      setSelectedHeater(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'running':
        return <Badge variant="default" className="bg-green-600">Ativo</Badge>;
      case 'paused':
        return <Badge variant="outline">Pausado</Badge>;
      case 'completed':
        return <Badge variant="success">Concluído</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
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
                  Data
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Nome
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Número
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Tempo
                </TableHead>
                <TableHead className="relative w-10 px-6 py-3">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 px-6 py-4 text-center">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando aquecimentos...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : heaters?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 px-6 py-4 text-center">
                    <div className="flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-400">
                      <svg className="mb-2 h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <p className="text-sm font-medium">Nenhum aquecimento encontrado</p>
                      <p className="text-xs">Crie um novo aquecimento para começar</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                heaters?.map((heater) => (
                  <TableRow key={heater._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <TableCell className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(heater.createdAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(heater.status)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {heater.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {heater.phoneNumber || 'N/A'}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {heater.time}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          {heater.status === 'running' && (
                            <>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleEditClick(heater);
                                }}
                                className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 focus:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700"
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleCancelClick(heater);
                                }}
                                className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-amber-600 hover:bg-amber-50 focus:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/30 dark:focus:bg-amber-900/30"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancelar
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteClick(heater);
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar aquecimento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar o aquecimento de <strong>{selectedHeater?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              disabled={isCanceling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
