"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createContactList } from "@/app/_server-actions/contacts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Plus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ManageContactsModal } from "./manageContactsModal";

export function UploadContactsModal() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    file: null,
  });
  const [showManageModal, setShowManageModal] = useState(false);
  const [uploadedList, setUploadedList] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Por favor, selecione um arquivo CSV ou Excel válido");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Por favor, insira um nome para a lista");
      return;
    }

    if (!formData.file) {
      toast.error("Por favor, selecione um arquivo para enviar");
      return;
    }

    try {
      setIsLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append("file", formData.file);
      formDataToSend.append("name", formData.name);

      const result = await createContactList(formDataToSend, formData.name);
      
      if (result.success) {
        // Reset form
        setFormData({ name: "", file: null });
        
        // Store the uploaded list data
        setUploadedList(result.data.data);
        
        // Close the upload modal
        setOpen(false);
        
        // Show manage modal after a small delay
        setTimeout(() => {
          setShowManageModal(true);
        }, 100);
      } else {
        throw new Error(result.error || "Erro ao criar lista de contatos");
      }
    } catch (error) {
      console.error("Erro ao enviar arquivo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Nova Lista
          </Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar nova lista de contatos</DialogTitle>
            <DialogDescription>
              Preencha os campos abaixo para criar uma nova lista de contatos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome da Lista</Label>
              <Input
                id="name"
                placeholder="Ex: Clientes VIP"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                disabled={isLoading}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="file">Arquivo de Contatos</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  accept=".csv, .xls, .xlsx, text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={isLoading}
                  className="hidden"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {formData.file ? formData.file.name : "Selecionar arquivo"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Formatos suportados: .csv, .xls, .xlsx
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Criar Lista"
              )}
            </Button>
          </DialogFooter>
        </form>
        </DialogContent>
      </Dialog>

      {uploadedList && (
        <ManageContactsModal
          open={showManageModal}
          onOpenChange={setShowManageModal}
          contacts={uploadedList.contacts}
          listId={uploadedList._id}
          onContactsUpdate={() => {
            setOpen(false);
          }}
        />
      )}
    </>
  );
}
