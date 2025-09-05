"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { FaWhatsapp } from "react-icons/fa";
import Axios from "axios";
import Cookies from "js-cookie";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);


  function onSubmit(values) {
    setIsLoading(true);
    setTimeout(() => {
      const { email, password } = values;
      Axios.post("https://prod.libanoinstituto.com.br/login", { 
        login: email, pass: password 
      })
        .then((response) => {
          console.log(response.data);
          if (response.data.code === 200) {
            const expiryTime = response.data.data.exp || "1d";
            const expires = new Date();
            
            const value = parseInt(expiryTime.match(/\d+/)[0]);
            const unit = expiryTime.match(/[dhm]/)?.[0] || 'd';
            
            if (unit === 'd') {
              expires.setTime(expires.getTime() + value * 24 * 60 * 60 * 1000);
            } else if (unit === 'h') {
              expires.setTime(expires.getTime() + value * 60 * 60 * 1000);
            } else if (unit === 'm') {
              expires.setTime(expires.getTime() + value * 60 * 1000);
            }
            
            Cookies.set('user', response.data.data.id, { expires });
            window.location.href = '/dashboard';
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 2000);
  }


  const schema = z.object({
    email: z.string().email({
      message: "Por favor, insira um email válido",
    }),
    password: z.string().min(6, {
      message: "A senha deve ter pelo menos 6 caracteres",
    }),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-0 shadow-2xl">
            <CardHeader className="space-y-1 text-center pb-4">
              <CardTitle className="text-2xl font-bold">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-600 bg-clip-text text-transparent mb-2">
                  WhatsApp Disparo
                </h1></CardTitle>
              <CardDescription className="text-base">
                Entre com sua conta para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Digite sua senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-12 bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Entrando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <FaWhatsapp className="w-4 h-4" />
                        <span>Entrar</span>
                      </div>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="">
              <p className="text-center text-sm text-muted-foreground w-full">
                Não tem uma conta?{" "}
                <Button variant="link" className="px-0 text-sm font-medium text-green-600 hover:text-green-700">
                  Contate o Administrador
                </Button>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
