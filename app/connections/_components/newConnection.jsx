"use client";

import { Button } from "@/components/ui/button";
import DefaultDialog from "@/app/_components/defaultDialog/defaultDialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createConnection } from "@/app/_server-actions/connections";
import { useState } from "react";
import { QrCodeModal } from "./QrCodeModal";

const schema = z.object({
    name: z.string().min(2, {
        message: "Nome deve ter pelo menos 2 caracteres",
    }),
    newNumber: z.boolean().default(false),
});


export default function NewConnection() {
    const [qrCode, setQrCode] = useState("");
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [connectionId, setConnectionId] = useState("");
    const [connectionName, setConnectionName] = useState("");

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            newNumber: false,
        },
    });

    const onSubmit = async (values) => {
        setIsCreating(true);
        try {
            const response = await createConnection(values);
            setQrCode(response.data.qr);
            setConnectionId(response.data.instanceName);
            setConnectionName(values.name);
            setIsFormDialogOpen(false);
            setIsQrDialogOpen(true);
        } catch (error) {
            console.error('Error creating connection:', error);
        } finally {
            setIsCreating(false);
        }
    };



    return (
        <div>
            <DefaultDialog 
                title="Nova Conexão" 
                description="Insira as informações da sua conexão" 
                button="Nova Conexão"
                open={isFormDialogOpen}
                onOpenChange={setIsFormDialogOpen}
            >
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-col items-start space-y-4 w-full"
                    >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Nome da conexão</FormLabel>
                                <FormControl>
                                    <Input className="w-full" placeholder="Insira o nome da sua conexão" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="newNumber"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-1 space-y-0">
                                <FormControl>
                                    <Checkbox
                                         checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                        Numero novo?
                                    </FormLabel>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="space-y-4 w-full">
                        <Button 
                            type="submit" 
                            disabled={isCreating}
                            className={`w-full h-12 bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] ${isCreating ? 'opacity-80 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {isCreating && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                <span>{isCreating ? 'Criando...' : 'Criar Conexão'}</span>
                            </div>
                        </Button>
                    </div>

                    </form>
                </Form>
            </DefaultDialog>

            <QrCodeModal 
                isOpen={isQrDialogOpen}
                onOpenChange={(open) => {
                    setIsQrDialogOpen(open);
                    if (!open) {
                        setQrCode("");
                        setConnectionId("");
                        setConnectionName("");
                    }
                }}
                qrCode={qrCode}
                connectionId={connectionId}
                connectionName={connectionName}
            />
        </div>
    )
}