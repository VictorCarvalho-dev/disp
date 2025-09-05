"use server";

import Axios from "axios";
import { cookies } from "next/headers";
import { revalidateTag } from 'next/cache';

export async function getConnections() {
    try {
        console.log("[Server-Action] Carregando Conexões")
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const connections = await Axios.get("https://sand.libanoinstituto.com.br/listConnections/all", {
            headers: {
                "Key": userCookie?.value
            },
            next: { tags: ['connections'] }
        });
        return connections.data.data;
    } catch (error) {
        return error;
    }
}

export async function getActiveConnections() {
    try {
        console.log("[Server-Action] Carregando Conexões")
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const connections = await Axios.get("https://sand.libanoinstituto.com.br/listConnections/active", {
            headers: {
                "Key": userCookie?.value
            },
            next: { tags: ['connections'] }
        });
        return connections.data.data;
    } catch (error) {
        return error;
    }
}

export async function getHeaterConnections() {
    try {
        console.log("[Server-Action] Carregando Conexões")
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const connections = await Axios.get("https://sand.libanoinstituto.com.br/listConnections/heater", {
            headers: {
                "Key": userCookie?.value
            },
            next: { tags: ['connections'] }
        });
        return connections.data.data;
    } catch (error) {
        return error;
    }
}

export async function createConnection(values) {
    console.log("[Server-Action] Criando Conexão")
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const connections = await Axios.post("https://sand.libanoinstituto.com.br/createConnection", {
            instanceName: values.name,
            heater: values.newNumber,
        }, {
            headers: {
                "Key": userCookie?.value
            }
        });
        console.log("[Server-Action] Conexão criada com sucesso")
        return connections.data;
    } catch (error) {
        console.log("[Server-Action] Erro ao criar conexão")
        return error;
    }
    finally {
        revalidateTag('connections');
    }
}

export async function deleteConnection(id) {
    console.log("[Server-Action] Deletando Conexão")
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const connections = await Axios.delete(`https://sand.libanoinstituto.com.br/deleteConnection/${id}`, {
            headers: {
                "Key": userCookie?.value
            }
        });
        console.log("[Server-Action] Conexão deletada com sucesso")
        return connections.data;
    } catch (error) {
        console.log("[Server-Action] Erro ao deletar conexão")
        return error;
    }
    finally {
        revalidateTag('connections');
    }
}

export async function statusConnection(id) {
    console.log("[Server-Action] Verificando Status da Conexão")
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const connections = await Axios.get(`https://sand.libanoinstituto.com.br/checkConnection/${id}`, {
            headers: {
                "Key": userCookie?.value
            }
        });
        console.log("[Server-Action] Status da Conexão", connections.data)
        return connections.data;
    } catch (error) {
        console.log("[Server-Action] Erro ao verificar status da conexão", error)
        return error;
    }
    finally {
        revalidateTag('connections');
    }
}

export async function updateConnection(id, data) {
    console.log("[Server-Action] Atualizando Conexão")
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const connection = await Axios.put(`https://sand.libanoinstituto.com.br/updateHeater/${id}`, {
            heater: data,
        }, {
            headers: {
                "Key": userCookie?.value
            }
        });
        console.log("[Server-Action] Conexão atualizada com sucesso")
        return connection.data;
    } catch (error) {
        console.log("[Server-Action] Erro ao atualizar conexão", error)
        return error;
    }
    finally {
        revalidateTag('connections');
    }
}

export async function generateQrCode(id) {
    console.log("[Server-Action] Gerando QrCode")
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const connections = await Axios.get(`https://sand.libanoinstituto.com.br/qrcodeConnection/${id}`, {
            headers: {
                "Key": userCookie?.value
            }
        });
        console.log("[Server-Action] QrCode gerado com sucesso")
        return connections.data;
    } catch (error) {
        console.log("[Server-Action] Erro ao gerar QrCode", error)
        return error;
    }
}

export async function disconnectConnection(id) {
    console.log("[Server-Action] Desconectando Conexão", id);
    try {
        const cookieStore = await cookies();
        const userCookie = cookieStore.get("user");
        const response = await Axios.put(
            `https://sand.libanoinstituto.com.br/disconnectConnection/${id}`,
            {}, // corpo vazio se não for necessário
            { // headers como terceiro parâmetro
                headers: {
                    "Key": userCookie?.value || ''
                }
            }
        );
        console.log("[Server-Action] Conexão desconectada com sucesso")
        return response.data;
    } catch (error) {
        console.log("[Server-Action] Erro ao desconectar conexão", error)
        return error;
    }
    finally {
        revalidateTag('connections');
    }
}

