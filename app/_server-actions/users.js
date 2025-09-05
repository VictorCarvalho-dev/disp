"use server";

import Axios from "axios";
import { cookies } from "next/headers";
import { revalidateTag, cache } from 'next/cache';

export async function getUsers() {
    console.log("[Server-Action] Carregando Usuários")
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const users = await Axios.get("https://prod.libanoinstituto.com.br/users", {
            headers: {
                "Key": userCookie?.value
            },
            next: { tags: ['users'] }
        });
        console.log("[Server-Action] Usuários carregados com sucesso")
        return users.data.data;
    } catch (error) {
        console.log("[Server-Action] Erro ao carregar usuários", error)
        return error;
    }
}

export async function createUser(values) {
    console.log("[Server-Action] Criando Usuário")
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const users = await Axios.post("https://prod.libanoinstituto.com.br/create-user", {
            name: values.name,
            email: values.email,
            pass: values.password,
            permission: values.permission,
        }, {
            headers: {
                "Key": userCookie?.value
            }
        });
        console.log("[Server-Action] Usuário criado com sucesso")
        return users.data;
    } catch (error) {
        console.log("[Server-Action] Erro ao criar usuário")
        return error;
    }
    finally {
        revalidateTag('users');
    }
}

export async function deleteUser(id) {
    console.log("[Server-Action] Excluindo Usuário")
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const users = await Axios.delete(`https://prod.libanoinstituto.com.br/delete-user/${id}`, {
            headers: {
                "Key": userCookie?.value
            }
        });
        console.log("[Server-Action] Usuário excluído com sucesso")
        return users.data;
    } catch (error) {
        console.log("[Server-Action] Erro ao excluir usuário")
        return error;
    }
    finally {
        revalidateTag('users');
    }
}

export async function updateUser(id, values) {
    console.log("[Server-Action] Atualizando Usuário")
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const users = await Axios.put(`https://prod.libanoinstituto.com.br/update-user/${id}`, {
            name: values.name,
            email: values.email,
            pass: values.password,
            permission: values.permission,
        }, {
            headers: {
                "Key": userCookie?.value
            }
        });
        console.log("[Server-Action] Usuário atualizado com sucesso")
        return users.data;
    } catch (error) {
        console.log("[Server-Action] Erro ao atualizar usuário")
        return error;
    }
    finally {
        revalidateTag('users');
    }
}

