"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function EditConnectionModal({ 
  isOpen, 
  onOpenChange, 
  connection, 
  onSave 
}) {
  const [isNewNumber, setIsNewNumber] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update state when connection changes
  useEffect(() => {
    if (connection) {
      setIsNewNumber(connection.heater || false);
    }
  }, [connection]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(connection._id, { newNumber: isNewNumber });
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating connection:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTitle>

        </DialogTitle>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background/50" />
          <Card className="border-0 shadow-none bg-background/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold text-foreground/90">
                Configurações da Conexão
              </CardTitle>
              <DialogDescription className="text-foreground/70">
                Ajuste as configurações desta conexão WhatsApp
              </DialogDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/30">
                <div className="space-y-0.5">
                  <Label htmlFor="new-number" className="text-base font-medium">
                    Número Novo
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {isNewNumber 
                      ? 'Este número está marcado como novo e receberá aquecimento.'
                      : 'Este número não receberá aquecimento automático.'}
                  </p>
                </div>
                <Switch
                  id="new-number"
                  checked={isNewNumber}
                  onCheckedChange={setIsNewNumber}
                  className={cn(
                    isNewNumber ? 'bg-primary' : 'bg-muted-foreground/30',
                    'transition-colors duration-200'
                  )}
                />
              </div>
            </CardContent>
            
            <DialogFooter className="px-6 py-4 border-t bg-muted/20">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
                className="min-w-[100px]"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="min-w-[100px] bg-primary hover:bg-primary/90 transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : 'Salvar alterações'}
              </Button>
            </DialogFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
