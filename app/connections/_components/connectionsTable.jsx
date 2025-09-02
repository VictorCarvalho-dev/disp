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
import { generateQrCode, deleteConnection, disconnectConnection, updateConnection } from "@/app/_server-actions/connections";
import { useState } from 'react';
import { QrCodeModal } from "./QrCodeModal";
import { EditConnectionModal } from "./EditConnectionModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Power, Trash2, QrCode, Loader2, Pencil } from 'lucide-react';
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

export function ConnectionsTable({ connections, isLoading = false }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [connectionId, setConnectionId] = useState('');
  

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
      case 'open':
        return <Badge className="bg-green-500 hover:bg-green-600">Conectado</Badge>;
      case 'close':
        return <Badge variant="outline">Desconectado</Badge>;
      case 'connecting':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Conectando...</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A';
    const cleaned = phone.toString().replace(/\D/g, '');
    const brazilMatch = cleaned.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
    if (brazilMatch) {
      return `(${brazilMatch[1]}) ${brazilMatch[2]}-${brazilMatch[3]}`;
    }
    const localMatch = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/);
    if (localMatch) {
      return `(${localMatch[1]}) ${localMatch[2]}-${localMatch[3]}`;
    }
    return phone;
  };

  const handleDeleteClick = (connection) => {
    setSelectedConnection(connection);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedConnection) return;
    setIsDeleting(true);
    try {
      const connectionId = selectedConnection.connectionId || selectedConnection.instanceName;
      console.log('Excluindo conexão com ID:', connectionId);
      await deleteConnection(connectionId);
      setSelectedConnection(null);
    } catch (error) {
      console.error('Erro ao excluir conexão:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateConnection = async (id, data) => {
    try {
      setIsEditing(true);
      await updateConnection(id, data.newNumber);
      setEditDialogOpen(false);
      setSelectedConnection(null);
    } catch (error) {
      console.error('Error updating connection:', error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleAction = async (action, connection) => {
    setActiveDropdown(null);
    
    if (action === 'qr') {
      try {
        setIsLoadingQr(true);
        setSelectedConnection(connection);
        const result = await generateQrCode(connection.connectionId || connection.instanceName);
        if (result?.data?.qr) {
          setQrCodeData(result.data.qr);
          setConnectionId(connection.connectionId || connection.instanceName);
          setQrDialogOpen(true);
        }
      } catch (error) {
        console.error('Error generating QR code:', error);
      } finally {
        setIsLoadingQr(false);
      }
    } else if (action === 'edit') {
      setSelectedConnection(connection);
      setEditDialogOpen(true);
    } else if (action === 'delete') {
      handleDeleteClick(connection);
    } else if (action === 'disconnect') {
      disconnectConnection(connection.instanceName);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Data</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Nome da Conexão</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Nome do WhatsApp</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Número</TableHead>
            <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Usuário</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-32 px-6 py-4 text-center">
                <div className="flex flex-col items-center justify-center py-6">
                  <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Carregando conexões...</p>
                </div>
              </TableCell>
            </TableRow>
          ) : connections?.length > 0 ? (
            connections.map((connection) => (
              <TableRow
                key={connection.instanceName}
                className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
              >
                <TableCell>
                  {formatDate(connection.createdAt || new Date().toISOString())}
                </TableCell>
                <TableCell>
                  {getStatusBadge(connection.status || 'disconnected')}
                </TableCell>
                <TableCell className="font-medium">
                  {connection.name || 'Sem nome'}
                </TableCell>
                <TableCell>
                  {connection.profileName || 'Não configurado'}
                </TableCell>
                <TableCell>
                  {formatPhoneNumber(connection.profilePhone)}
                </TableCell>
                <TableCell>
                  {connection.userName || 'Admin'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu open={activeDropdown === connection.instanceName} onOpenChange={(open) => {
                    setActiveDropdown(open ? connection.instanceName : null);
                  }}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <MoreVertical className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                    >
                      <>
                        
                        {connection.status === 'open' && (
                          <DropdownMenuItem 
                            onClick={() => handleAction('disconnect', connection)}
                            className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-amber-600 hover:bg-amber-50 focus:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/30 dark:focus:bg-amber-900/30"
                          >
                            <Power className="mr-2 h-4 w-4" />
                            <span>Desconectar</span>
                          </DropdownMenuItem>
                        )}
                        
                        
                      </>

                     {connection.status !== 'open' && (
                         <DropdownMenuItem
                           onClick={() => handleAction('qr', connection)}
                           className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 focus:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:bg-slate-700"
                           disabled={isLoadingQr}
                         >
                           {isLoadingQr && selectedConnection?.connectionId === connection.connectionId ? (
                             <>
                               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                               <span>Gerando QR Code...</span>
                             </>
                           ) : (
                             <>
                               <QrCode className="mr-2 h-4 w-4" />
                               <span>Gerar QR Code</span>
                             </>
                           )}
                         </DropdownMenuItem>  )}

                         <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            handleAction('edit', connection);
                          }}
                          className="flex cursor-pointer items-center rounded-md px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 focus:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 dark:focus:bg-blue-900/30"
                          disabled={isEditing}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                      <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            handleAction('delete', connection);
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
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center py-6 text-slate-500 dark:text-slate-400">
                  <svg className="mb-2 h-12 w-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-medium">Nenhuma conexão encontrada</p>
                  <p className="text-xs">Adicione uma nova conexão para começar</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a conexão <span className="font-semibold">{selectedConnection?.name || selectedConnection?.instanceName}</span>?
              Esta ação não pode ser desfeita.
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
              ) : (
                'Excluir'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <QrCodeModal 
        isOpen={qrDialogOpen}
        onOpenChange={setQrDialogOpen}
        qrCode={qrCodeData}
        connectionId={connectionId}
        connectionName={selectedConnection?.name}
      />
      
      <EditConnectionModal
        isOpen={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        connection={selectedConnection}
        onSave={handleUpdateConnection}
      />
    </div>
  );
}