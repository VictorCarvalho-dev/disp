"use server";

import Axios from "axios";
import { cookies } from "next/headers";

export async function getSession() {
    console.log("[Server-Action] Carregando sessão");
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const users = await Axios.get("https://pro.libanoinstituto.com.br/users", {
            headers: {
                "Key": userCookie?.value,
            },
            next: { tags: ['session'] }
        });
        if (users.data.data.map(user => user._id).includes(userCookie?.value)) {
            const user =  {
                nome: users.data.data.find(user => user._id === userCookie?.value).name,
                permissao: users.data.data.find(user => user._id === userCookie?.value).permission,
            }
            console.log("[Server-Action] Sessão carregada com sucesso", user);
            return user || [];
        }
    } catch (error) {
        console.log("[Server-Action] Erro ao carregar sessão, redirecionando para login");
        return [];
    }
}
