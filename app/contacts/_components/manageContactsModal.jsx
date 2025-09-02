"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { X, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { deleteContactByIds } from "@/app/_server-actions/contacts";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ManageContactsModal({ 
  open, 
  onOpenChange, 
  contacts = [], 
  listId,
  listName,
  onContactsUpdate 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [currentContacts, setCurrentContacts] = useState(contacts);
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedCount, setDisplayedCount] = useState(30);
  const scrollContainerRef = useRef(null);
  const isLoadingMore = useRef(false);
  
  useEffect(() => {
    setCurrentContacts(contacts);
  }, [contacts]);

  useEffect(() => {
    setSelectedContacts([]);
    setSearchTerm("");
    setDisplayedCount(30);
  }, [open]);

  const toggleSelectContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleRemoveSelected = async () => {
    if (selectedContacts.length === 0) return;
    
    try {
      setIsLoading(true);
      const result = await deleteContactByIds(selectedContacts, listId);
      
      if (result.success) {
        toast.success(
          `${selectedContacts.length} ${selectedContacts.length === 1 ? 'contato removido' : 'contatos removidos'} com sucesso!`,
          {
            description: `Foram removidos ${selectedContacts.length} ${selectedContacts.length === 1 ? 'contato' : 'contatos'} da lista.`,
            action: {
              label: "Fechar",
              onClick: () => {}
            }
          }
        );
        
        const updatedContacts = currentContacts.filter(
          contact => !selectedContacts.includes(contact.id || contact._id)
        );
        
        setCurrentContacts(updatedContacts);
        setSelectedContacts([]);
        
        if (onContactsUpdate) {
          onContactsUpdate(updatedContacts);
        }
      } else {
        throw new Error(result.error || "Erro ao remover contatos");
      }
    } catch (error) {
      console.error("Erro ao remover contatos:", error);
      toast.error("Não foi possível remover os contatos", {
        description: error.message || "Ocorreu um erro ao tentar remover os contatos selecionados. Por favor, tente novamente.",
        action: {
          label: "Entendi",
          onClick: () => {}
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    onOpenChange(false);
  };

  // Filter contacts based on search term
  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return currentContacts;
    
    const term = searchTerm.toLowerCase();
    return currentContacts.filter(contact => 
      contact.nome?.toLowerCase().includes(term) ||
      String(contact.telefone || contact.phone).includes(term)
    );
  }, [currentContacts, searchTerm]);

  // Get displayed contacts with infinite scroll limit
  const displayedContacts = useMemo(() => {
    return filteredContacts.slice(0, displayedCount);
  }, [filteredContacts, displayedCount]);

  // Handle infinite scroll
  const handleScroll = useCallback((e) => {
    if (isLoadingMore.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
    
    if (isNearBottom && displayedCount < filteredContacts.length) {
      isLoadingMore.current = true;
      const currentScrollTop = scrollTop;
      
      setDisplayedCount(prev => {
        const newCount = Math.min(prev + 30, filteredContacts.length);
        
        // Restore scroll position after state update
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = currentScrollTop;
          }
          isLoadingMore.current = false;
        }, 0);
        
        return newCount;
      });
    }
  }, [displayedCount, filteredContacts.length]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setDisplayedCount(30); // Reset display count when searching
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {listName ? `Gerenciar: ${listName}` : 'Gerenciar Contatos'}
          </DialogTitle>
          <DialogDescription>
            {listName 
              ? `Visualize e gerencie os contatos desta lista`
              : 'Selecione os contatos que deseja remover da lista'}
          </DialogDescription>
        </DialogHeader>
        
        {/* Search Bar */}
        <div className="px-1 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Pesquisar por nome ou telefone..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <div className="text-sm text-muted-foreground mt-2">
              {filteredContacts.length} {filteredContacts.length === 1 ? 'contato encontrado' : 'contatos encontrados'}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2" onScroll={handleScroll} ref={scrollContainerRef}>
          <div className="space-y-2">
            {displayedContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? 'Nenhum contato encontrado' : 'Nenhum contato na lista'}
              </div>
            ) : (
              displayedContacts.map((contact) => (
              <div 
                key={`${contact.id || contact._id || Math.random().toString(36).substr(2, 9)}`}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 group"
              >
                <div className="flex items-center space-x-3">
                  <Checkbox 
                    id={`contact-${contact.id}`}
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={() => toggleSelectContact(contact.id)}
                  />
                  <label 
                    htmlFor={`contact-${contact.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{contact.nome}</div>
                    <div className="text-sm text-muted-foreground">
                      {String(contact.telefone || contact.phone).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                    </div>
                  </label>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleSelectContact(contact.id)}
                  className={selectedContacts.includes(contact.id) ? "text-destructive" : "opacity-0 group-hover:opacity-100"}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              ))
            )}
            {displayedCount < filteredContacts.length && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Mostrando {displayedCount} de {filteredContacts.length} contatos
                <br />
                <span className="text-xs">Role para baixo para carregar mais</span>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
          <div className="text-sm text-muted-foreground">
            {selectedContacts.length > 0 && (
              `${selectedContacts.length} ${selectedContacts.length === 1 ? 'contato selecionado' : 'contatos selecionados'}`
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex gap-2">
              <Button 
                variant="destructive"
                onClick={handleRemoveSelected}
                disabled={selectedContacts.length === 0 || isLoading}
                className="w-1/2 sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removendo...
                  </>
                ) : (
                  `Remover (${selectedContacts.length})`
                )}
              </Button>
              <Button 
              variant="outline" 
              onClick={handleConfirm}
              className="w-full sm:w-auto"
            >
              Confirmar
            </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
