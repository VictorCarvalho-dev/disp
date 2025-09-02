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
import { MoreVertical, Eye, Trash2, Pencil, Loader2, Pause, Play, XCircle } from 'lucide-react';
import { toast } from "sonner";
import { actionShot } from "@/app/_server-actions/shots";
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

export function ShotsTable({ shots, onDeleteShot, isLoading = false, onAction }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedShot, setSelectedShot] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [rowLoading, setRowLoading] = useState({}); // { [shotId]: boolean }

  const handleDeleteClick = (shot) => {
    setSelectedShot(shot);
    setDeleteDialogOpen(true);
  };

  const setLoadingFor = (shotId, value) => {
    setRowLoading((prev) => ({ ...prev, [shotId]: value }));
  };

  const handleAction = async (shot, action) => {
    if (action === 'canceled') {
      setSelectedShot(shot);
      setCancelDialogOpen(true);
      return;
    }
    
    setLoadingFor(shot._id, true);
    try {
      const res = await actionShot(shot._id, action);
      if (res?.success) {
        const msg = action === 'pause' ? 'Disparo pausado' : 'Disparo retomado';
        toast.success(msg);
        onAction?.();
      } else {
        toast.error(res?.error || 'Falha ao executar ação');
      }
    } catch (e) {
      toast.error('Erro ao executar ação');
      console.error(e);
    } finally {
      setLoadingFor(shot._id, false);
    }
  };
  
  const handleConfirmCancel = async () => {
    if (!selectedShot) return;
    
    setLoadingFor(selectedShot._id, true);
    setIsCanceling(true);
    try {
      const res = await actionShot(selectedShot._id, 'canceled');
      if (res?.success) {
        toast.success('Disparo cancelado com sucesso');
        onAction?.();
      } else {
        toast.error(res?.error || 'Falha ao cancelar disparo');
      }
    } catch (e) {
      toast.error('Erro ao cancelar disparo');
      console.error(e);
    } finally {
      setLoadingFor(selectedShot._id, false);
      setIsCanceling(false);
      setCancelDialogOpen(false);
      setSelectedShot(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedShot) return;
    
    setIsDeleting(true);
    try {
      await onDeleteShot(selectedShot._id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting shot:', error);
    } finally {
      setIsDeleting(false);
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
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Enviando</Badge>;
      case 'done':
        return <Badge className="bg-green-500 hover:bg-green-600">Concluído</Badge>;
      case 'waiting':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Aguardando</Badge>;
      case 'paused':
        return <Badge className="bg-gray-500 hover:bg-gray-600">Pausado</Badge>;
      case 'canceled':
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelado</Badge>;
      case 'error':
        return <Badge className="bg-red-500 hover:bg-red-600">Erro</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mensagens</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 px-6 py-4 text-center">
                <div className="flex flex-col items-center justify-center py-6">
                  <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando disparos...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : shots?.length > 0 ? (
            shots.map((shot) => (
              <TableRow key={shot._id}>
                <TableCell className="font-medium">{shot.userName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(shot.status)}

                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>Total: {shot.statusProgress?.contacts || 0}</span>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Sucesso: {shot.statusProgress?.sucess || 0}
                    </span>
                      <span className="text-sm text-red-600 dark:text-red-400">
                        Erro: {shot.statusProgress.error}
                      </span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(shot.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!!rowLoading[shot._id]}>
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Abrir menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {(() => {
                        const actions = [];
                        
                        // Pause/Resume action
                        if (shot.status === 'running' || shot.status === 'waiting' || shot.status === 'paused') {
                          actions.push(
                            <DropdownMenuItem
                              key="pause-resume"
                              onClick={() => handleAction(shot, shot.status === 'paused' ? 'resume' : 'pause')}
                              disabled={!!rowLoading[shot._id] || shot.status === 'done' || shot.status === 'canceled'}
                            >
                              {shot.status === 'paused' ? (
                                <>
                                  <Play className="mr-2 h-4 w-4" />
                                  Retomar
                                </>
                              ) : (
                                <>
                                  <Pause className="mr-2 h-4 w-4" />
                                  Pausar
                                </>
                              )}
                            </DropdownMenuItem>
                          );
                        }
                        
                        // Cancel action
                        if (shot.status !== 'done' && shot.status !== 'canceled') {
                          actions.push(
                            <DropdownMenuItem
                              key="cancel"
                              onClick={(e) => {
                                e.preventDefault();
                                setSelectedShot(shot);
                                setCancelDialogOpen(true);
                              }}
                              disabled={!!rowLoading[shot._id]}
                              className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancelar
                            </DropdownMenuItem>
                          );
                        }
                        
                        // If no actions are available
                        if (actions.length === 0) {
                          return (
                            <div className="px-3 py-2 text-sm text-muted-foreground">
                              Nenhuma ação disponível
                            </div>
                          );
                        }
                        
                        return actions;
                      })()}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-32 px-6 py-4 text-center">
                <div className="flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-400">
                  <svg className="mb-2 h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="text-sm font-medium">Nenhum disparo encontrado</h3>
                  <p className="text-xs">Comece criando um novo disparo.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir disparo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este disparo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
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

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar disparo</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar este disparo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmCancel}
              disabled={isCanceling}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isCanceling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : 'Confirmar Cancelamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
