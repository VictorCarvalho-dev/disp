"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createHeater } from "@/app/_server-actions/heater";

const heaterSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  connectionsSelect: z.array(z.string()).min(1, {
    message: "Selecione pelo menos uma conexão",
  }),
  connectionHeater: z.string({
    required_error: "Selecione a conexão para aquecer",
  }),
  timeType: z.enum(["hours", "days"], {
    required_error: "Selecione o tipo de tempo",
  }),
  timeValue: z.string({
    required_error: "Informe o valor do tempo",
  }),
});

export function AddHeater({ connections, onSuccess, heaterConnections, activeConnections }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConnections, setSelectedConnections] = useState([]);

  const form = useForm({
    resolver: zodResolver(heaterSchema),
    defaultValues: {
      name: "",
      connectionsSelect: [],
      connectionHeater: "",
      timeType: "hours",
      timeValue: "2h",
    },
  });

  const timeType = form.watch("timeType");
  const timeValue = form.watch("timeValue");

  useEffect(() => {
    if (timeType === "hours" && !timeValue.endsWith('h')) {
      form.setValue("timeValue", "2h");
    } else if (timeType === "days" && !timeValue.endsWith('d')) {
      form.setValue("timeValue", "1d");
    }
  }, [timeType, form, timeValue]);

  const timeOptions = timeType === "hours" 
    ? ["2", "4", "8", "12", "24"] 
    : ["1", "2", "3", "5", "7"];

  const handleConnectionSelect = (connectionId) => {
    const currentConnections = form.getValues("connectionsSelect") || [];
    const newConnections = currentConnections.includes(connectionId)
      ? currentConnections.filter((id) => id !== connectionId)
      : [...currentConnections, connectionId];
    
    form.setValue("connectionsSelect", newConnections);
    setSelectedConnections(newConnections);
  };

  const formSelectedConnections = form.watch("connectionsSelect") || [];
  const selectedHeater = form.watch("connectionHeater");

  const availableConnections = connections.filter(
    (conn) => conn.status === 'open' && conn.instanceName !== selectedHeater && conn.heater === true
  );
  
  const availableHeaterConnections = connections.filter(
    (conn) => conn.status === 'open' && !formSelectedConnections.includes(conn.instanceName) 
  );

  const onSubmit = async (values) => {
    if (isLoading) return; 
    
    setIsLoading(true);
    try {
      const numericValue = values.timeValue.replace(/[^0-9]/g, '');
      const time = values.timeType === "hours" ? `${numericValue}h` : `${numericValue}d`;
      
      const payload = {
        name: values.name,
        connectionsSelect: values.connectionsSelect,
        connectionHeater: values.connectionHeater,
        time,
      };

      console.log("Payload:", payload);
      const result = await createHeater(payload);
      
      if (result?.success) {
        toast.success("Aquecimento criado com sucesso!");
        onSuccess?.();
        form.reset({
          name: "",
          connectionsSelect: [],
          connectionHeater: "",
          timeType: "hours",
          timeValue: "2h",
        });
        setSelectedConnections([]);
        setIsOpen(false);
      } else {
        throw new Error(result?.error || "Erro ao criar aquecimento");
      }
    } catch (error) {
      console.error("Erro ao criar aquecimento:", error);
      toast.error(error.message || "Erro ao criar aquecimento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open) => {
    if (!open) {
      setTimeout(() => {
        form.reset({
          name: "",
          connectionsSelect: [],
          connectionHeater: "",
          timeType: "hours",
          timeValue: "2h",
        });
        setSelectedConnections([]);
      }, 300);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Novo Aquecimento
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Adicionar Aquecimento
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">Nome do Aquecimento</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Aquecimento Setembro 2023" 
                        className="bg-white dark:bg-slate-800"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-1">
                <FormLabel className="text-slate-700 dark:text-slate-300 text-sm">Conexões para Aquecimento</FormLabel>
                <div className="space-y-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Selecione as conexões que serão aquecidas
                  </p>
                  <div className="border dark:border-slate-700 rounded-md p-2 max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-800/50">
                    {heaterConnections.length > 0 ? (
                      <div className="grid gap-2">
                        {heaterConnections.map((connection) => (
                          <div 
                            key={connection._id} 
                            className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                              selectedConnections.includes(connection._id) 
                                ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                            }`}
                          >
                            <Checkbox
                              id={`conn-${connection.instanceName}`}
                              checked={selectedConnections.includes(connection.instanceName)}
                              onCheckedChange={() => handleConnectionSelect(connection.instanceName)}
                              className="h-4 w-4 text-blue-600 dark:text-blue-400"
                            />
                            <label
                              htmlFor={`conn-${connection.instanceName}`}
                              className="text-sm font-medium text-slate-800 dark:text-slate-200 cursor-pointer flex-1"
                            >
                              <span className="block font-medium">{connection.name}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {connection.profilePhone || 'Número não disponível'}
                              </span>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Nenhuma conexão disponível
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <FormMessage>{form.formState.errors.connectionsSelect?.message}</FormMessage>
              </div>

              <div className="space-y-1.5">
                <FormLabel className="text-slate-700 dark:text-slate-300 text-sm">Conexão de Aquecimento</FormLabel>
                <FormField
                  control={form.control}
                  name="connectionHeater"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-slate-800 w-full">
                            <SelectValue placeholder="Selecione uma conexão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-60">
                          {activeConnections.filter((connection) => connection.status === "open").map((connection) => (
                            <SelectItem 
                              key={connection.instanceName} 
                              value={connection.instanceName}
                              className="flex flex-col items-start py-2"
                            >
                              <span className="font-medium text-slate-900 dark:text-slate-100">{connection.name || "Sem nome"}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {connection.profilePhone || 'Número não disponível'}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-md border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm">Duração do Aquecimento</h4>
                  
                  <div className="my-3">
                    <FormField
                      control={form.control}
                      name="timeType"
                      render={({ field }) => (
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4 p-2 bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 w-fit"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="hours" id="hours" className="h-4 w-4" />
                            <Label htmlFor="hours" className="font-medium text-slate-700 dark:text-slate-300">Horas</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="days" id="days" className="h-4 w-4" />
                            <Label htmlFor="days" className="font-medium text-slate-700 dark:text-slate-300">Dias</Label>
                          </div>
                        </RadioGroup>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="timeValue"
                    render={({ field }) => (
                      <div className="space-y-2">
                        <FormLabel className="text-slate-700 dark:text-slate-300 text-sm">Duração:</FormLabel>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-2"
                        >
                          {timeOptions.map((option) => (
                            <div key={option} className="relative">
                              <RadioGroupItem 
                                value={option} 
                                id={`time-${option}`} 
                                className="peer sr-only" 
                              />
                              <Label 
                                htmlFor={`time-${option}`} 
                                className="flex flex-col items-center justify-between rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer peer-data-[state=checked]:border-blue-500 dark:peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 dark:peer-data-[state=checked]:bg-blue-900/20 transition-colors"
                              >
                                <span className="text-base font-semibold text-slate-900 dark:text-white">
                                  {option}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {timeType === "hours" ? "horas" : "dias"}
                                </span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                  />
                </div>
                <FormMessage />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200 dark:border-slate-700 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset({
                      name: "",
                      connectionsSelect: [],
                      connectionHeater: "",
                      timeType: "hours",
                      timeValue: "2h",
                    });
                    setSelectedConnections([]);
                    setIsOpen(false);
                  }}
                  disabled={isLoading}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 px-6"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Aquecimento"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
