"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { MessageEditor } from "./messageEditor";
import { getConnections } from "@/app/_server-actions/connections";
import { getContacts } from "@/app/_server-actions/contacts";
import { createShot } from "@/app/_server-actions/shots";

export function AddShot({ onShotCreated }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const loadData = async () => {
    if (open) return; 

    try {
      setIsLoadingData(true);
      const [conns, conts] = await Promise.all([
        getConnections(),
        getContacts()
      ]);
      
      setConnections(conns || []);
      setContacts(conts || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Erro ao carregar dados. Tente novamente.");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (isOpen) {
      loadData();
    }
  };

  const handleSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const result = await createShot(data);
      if (result?.success) {
        toast.success("Disparo criado com sucesso!");
        onShotCreated?.();
        setOpen(false);
      } else {
        const errMsg = result?.error || "Falha ao criar disparo";
        toast.error(errMsg);
      }
    } catch (error) {
      console.error('Error creating shot:', error);
      toast.error("Erro ao criar disparo. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-green-500 hover:bg-green-600">
          <Plus className="mr-2 h-4 w-4" />
          Novo Disparo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] min-w-[90vw] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <DialogTitle className="text-xl font-semibold">Novo Disparo de Mensagem</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-6">
          {isLoadingData ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Carregando...</span>
            </div>
          ) : (
            <MessageEditor 
              onSave={handleSubmit} 
              onCancel={() => setOpen(false)}
              connections={connections}
              contacts={contacts}
              isLoading={isLoading}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
