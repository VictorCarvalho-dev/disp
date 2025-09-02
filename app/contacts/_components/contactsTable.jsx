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
import { MoreHorizontal, Trash2, Edit, Loader2 } from "lucide-react";
import { deleteContactList, getContactsByList } from "@/app/_server-actions/contacts";
import { ManageContactsModal } from "./manageContactsModal";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ContactsTable({ contacts }) {
  const [showManageModal, setShowManageModal] = useState(false);
  const [currentList, setCurrentList] = useState(null);
  const [listContacts, setListContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);

  const handleEditList = async (list) => {
    try {
      setIsLoading(true);
      const contacts = await getContactsByList(list._id);
      setListContacts(contacts);
      setCurrentList(list);
      setShowManageModal(true);
    } catch (error) {
      console.error("Erro ao carregar contatos da lista:", error);
      toast.error("Erro ao carregar contatos da lista");
    } finally {
      setIsLoading(false);
    }
  };
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


  const handleDeleteClick = (contact) => {
    setSelectedContact(contact);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedContact) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteContactList(selectedContact._id);
      
      if (result.success) {
        toast.success("Lista de contatos excluída com sucesso!");
        // Refresh the contacts list after successful deletion
        router.refresh();
      } else {
        throw new Error(result.error || "Erro ao excluir lista de contatos");
      }
    } catch (error) {
      console.error("Erro ao excluir lista de contatos:", error);
      toast.error(error.message || "Erro ao excluir lista de contatos", {
        description: "Por favor, tente novamente mais tarde.",
        action: {
          label: "Fechar",
          onClick: () => {}
        }
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedContact(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <>
    <div className="w-full overflow-hidden rounded-lg border">
      <div className="relative w-full overflow-x-auto">
        <Table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <TableHeader className="bg-slate-50 dark:bg-slate-800">
            <TableRow className="border-b border-slate-200 dark:border-slate-700">
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nome da Lista
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Criado por
              </TableHead>
              <TableHead className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Nº de Contatos
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
            {isTableLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 px-6 py-4 text-center">
                  <div className="flex flex-col items-center justify-center py-6">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando listas de contatos...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 px-6 py-4 text-center">
                  <div className="flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-400">
                    <svg className="mb-2 h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm font-medium">Nenhuma lista de contatos encontrada</p>
                    <p className="text-xs">Adicione uma nova lista para começar</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow key={contact._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <TableCell className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {contact.name}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4">
                    <Badge variant="outline" className="border-slate-200 dark:border-slate-600">
                      {contact.userName || "Sistema"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-center">
                    <Badge variant="secondary">
                      {contact.counterContacts?.toLocaleString('pt-BR') || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {formatDate(contact.createdAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <DropdownMenu
                      open={activeDropdown === contact._id}
                      onOpenChange={(open) => {
                        setActiveDropdown(open ? contact._id : null);
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
                            handleEditList(contact);
                          }}
                          className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 focus:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteClick(contact);
                          }}
                          className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 dark:focus:bg-red-900/30"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

      {currentList && (
        <ManageContactsModal
          open={showManageModal}
          onOpenChange={setShowManageModal}
          contacts={listContacts}
          listId={currentList._id}
          listName={currentList.name}
          onContactsUpdate={() => {
            setShowManageModal(false);
          }}
        />
      )}
    </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lista de contatos</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a lista "{selectedContact?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </>
  );
}
