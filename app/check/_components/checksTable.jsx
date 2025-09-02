"use client";

import { useState, useEffect } from "react";
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
import { MoreHorizontal, Download, XCircle, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelCheck, downloadCSV } from "@/app/_server-actions/check";
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
import { getChecks } from "@/app/_server-actions/check";

export function ChecksTable({ checks, isLoading }) {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [checkToCancel, setCheckToCancel] = useState(null);

  const handleDeleteClick = (check) => {
    setSelectedCheck(check);
    setDeleteDialogOpen(true);
  };

  const handleCancelClick = (check) => {
    setCheckToCancel(check);
    setShowCancelModal(true);
  };

  const confirmCancelCheck = async () => {
    if (!checkToCancel) return;
    
    try {
      setIsDeleting(true);
      const result = await cancelCheck(checkToCancel._id);
      if (result.success) {
        toast.success("Verificação cancelada com sucesso!");
        router.refresh();
      } else {
        throw new Error(result.error || "Erro ao cancelar verificação");
      }
    } catch (error) {
      console.error("Erro ao cancelar verificação:", error);
      toast.error(error.message || "Erro ao cancelar verificação", {
        description: "Por favor, tente novamente mais tarde.",
        action: {
          label: "Fechar",
          onClick: () => {}
        }
      });
    } finally {
      setIsDeleting(false);
      setShowCancelModal(false);
      setCheckToCancel(null);
    }
  };


  const handleCancelCheck = async () => {
    if (!selectedCheck) return;
    
    try {
      setIsDeleting(true);
      const result = await cancelCheck(selectedCheck._id);
      if (result.success) {
        toast.success("Verificação cancelada com sucesso!");
        router.refresh();
      } else {
        throw new Error(result.error || "Erro ao cancelar verificação");
      }
    } catch (error) {
      console.error("Erro ao cancelar verificação:", error);
      toast.error(error.message || "Erro ao cancelar verificação", {
        description: "Por favor, tente novamente mais tarde.",
        action: {
          label: "Fechar",
          onClick: () => {}
        }
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedCheck(null);
    }
  };

  const handleDownloadCSV = async (checkId) => {
    try {
      const result = await downloadCSV(checkId);
      if (result.success) {
        // Create a download link and trigger it
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `check_${checkId}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        throw new Error(result.error || "Erro ao baixar CSV");
      }
    } catch (error) {
      console.error("Erro ao baixar CSV:", error);
      toast.error(error.message || "Erro ao baixar CSV", {
        description: "Por favor, tente novamente mais tarde.",
        action: {
          label: "Fechar",
          onClick: () => {}
        }
      });
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'done':
        return <Badge className="bg-green-500 hover:bg-green-600">Concluído</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Processando</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'canceled':
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Cancelado</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const isActionDisabled = (check) => {
    // Only disable the download button if status is not 'done' or 'canceled'
    return !['done', 'canceled'].includes(check.status);
  };

  return (
    <>
      <div className="w-full overflow-hidden rounded-lg border">
        <div className="relative w-full overflow-x-auto">
          <Table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <TableHeader className="bg-slate-50 dark:bg-slate-800">
              <TableRow className="border-b border-slate-200 dark:border-slate-700">
                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Nome da Verificação
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Criado por
                </TableHead>
                <TableHead className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Contatos
                </TableHead>
                <TableHead className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Progresso
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Data de Criação
                </TableHead>
                <TableHead className="relative w-10 px-6 py-3">
                  <span className="sr-only">Ações</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-800">
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 px-6 py-4 text-center">
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando verificações...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : checks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 px-6 py-4 text-center">
                    <div className="flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-400">
                      <svg className="mb-2 h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium">Nenhuma verificação encontrada</p>
                      <p className="text-xs">Crie uma nova verificação para começar</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                checks.map((check) => (
                  <TableRow key={check._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <TableCell className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {check.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-6 py-4">
                      <Badge variant="outline" className="border-slate-200 dark:border-slate-600">
                        {check.userName || "Sistema"}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-6 py-4 text-center">
                      {getStatusBadge(check.status)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-6 py-4 text-center">
                      <Badge variant="secondary">
                        {check.statusProgress?.contacts?.toLocaleString('pt-BR') || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div 
                            className="h-full bg-green-500 transition-all duration-300"
                            style={{
                              width: `${(check.statusProgress?.progress / check.statusProgress?.contacts) * 100 || 0}%`
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {Math.round((check.statusProgress?.progress / check.statusProgress?.contacts) * 100) || 0}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(check.createdAt)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <DropdownMenu
                        open={activeDropdown === check._id}
                        onOpenChange={(open) => {
                          setActiveDropdown(open ? check._id : null);
                        }}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              handleDownloadCSV(check._id);
                            }}
                            disabled={isActionDisabled(check)}
                            className={`flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm ${isActionDisabled(check) ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-100 focus:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700'}`}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            <span>Download CSV</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.preventDefault();
                              if (['processing', 'running'].includes(check.status)) {
                                handleCancelClick(check);
                              }
                            }}
                            disabled={!['processing', 'running'].includes(check.status)}
                            className={`flex items-center rounded-md px-2 py-1.5 text-sm ${!['processing', 'running'].includes(check.status) ? 'text-slate-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 dark:focus:bg-red-900/30 cursor-pointer'}`}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            <span>Cancelar</span>
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
            <AlertDialogTitle>Cancelar verificação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a verificação "{selectedCheck?.name}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleCancelCheck}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : 'Cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Modal */}
      <AlertDialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar verificação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar a verificação "{checkToCancel?.name}"?
              <br />
              <span className="text-sm text-amber-600 dark:text-amber-400">Esta ação não pode ser desfeita.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Voltar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmCancelCheck}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : 'Confirmar Cancelamento'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
