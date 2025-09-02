"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, X } from "lucide-react";
import { createCheck } from "@/app/_server-actions/check";

export function UploadCheckModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [name, setName] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      if (!name) {
        const baseName = file.name.split('.').slice(0, -1).join('.');
        setName(baseName);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!fileInputRef.current?.files?.[0]) {
     
      return console.log("Nenhum arquivo selecionado");
    }

    if (!name.trim()) {
      return console.log("Por favor, insira um nome para a verificação.");
    }

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", fileInputRef.current.files[0]);
      
      const result = await createCheck(formData, name);
      
      if (result.success) {
        console.log("Verificação criada com sucesso!");
        setIsOpen(false);
        // Reset form
        setFileName("");
        setName("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        throw new Error(result.error || "Erro ao criar verificação");
      }
    } catch (error) {
      console.error("Erro ao criar verificação:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button className="bg-green-500 hover:bg-green-600" onClick={() => setIsOpen(true)}>
        <Upload className="mr-2 h-4 w-4" />
        Adicionar Verificação
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Nova Verificação</DialogTitle>
              <DialogDescription>
                Faça upload de um arquivo CSV para verificar os contatos.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  placeholder="Nome da verificação"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  Arquivo
                </Label>
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="file-upload"
                      className="flex flex-1 cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span>{fileName || "Selecione um arquivo"}</span>
                      <Upload className="ml-2 h-4 w-4" />
                    </Label>
                    <Input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".csv,.xls,.xlsx"
                      onChange={handleFileChange}
                      required
                    />
                    {fileName && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFileName("");
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remover arquivo</span>
                      </Button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Formatos aceitos: .csv, .xls, .xlsx
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button className="bg-green-500 hover:bg-green-600" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  "Enviar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
