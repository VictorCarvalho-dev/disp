"use server";

import Axios from "axios";
import { cookies } from "next/headers";
import { revalidateTag } from 'next/cache';

export async function getContacts() {
  console.log("[Server-Action] Carregando Contatos");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.get("http://94.72.125.153:8443/listContacts", {
      headers: {
        "Key": userCookie?.value,
      },
      next: { tags: ['contacts'] }
    });
    console.log("[Server-Action] Contatos carregados com sucesso");
    return response.data.data || [];
  } catch (error) {
    console.log("[Server-Action] Erro ao carregar contatos", error);
    return [];
  }
}

export async function getContactsByList(listId) {
    console.log("[Server-Action] Carregando Contatos da lista");
    try {
      const cookieStore = await cookies();
      const userCookie = cookieStore.get("user");
      const response = await Axios.get(`http://94.72.125.153:8443/contact/${listId}`, {
        headers: {
          "Key": userCookie?.value,
        },
        next: { tags: ['list-contacts'] }
      });
      console.log("[Server-Action] Contatos da lista carregados com sucesso");
      return response.data.data.contacts || [];
    } catch (error) {
      console.log("[Server-Action] Erro ao carregar contatos da lista", error);
      return [];
    }
  }

export async function createContactList(data, name) {
  console.log("[Server-Action] Criando Lista de Contatos");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.post(
      `http://94.72.125.153:8443/uploadContacts/${name}`,
      data,
      {
        headers: {
          "Key": userCookie?.value,
        },
      }
    );
    console.log("[Server-Action] Lista de contatos criada com sucesso");
    return { success: true, data: response.data };
  } catch (error) {
    console.log("[Server-Action] Erro ao criar lista de contatos", error);
    return { success: false, error: error.response?.data?.message || "Erro ao criar lista de contatos" };
  } finally {
    revalidateTag('contacts');
  }
}

export async function deleteContactByIds(ids, listId) {
  console.log("[Server-Action] Excluindo Lista de Contatos");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.put(
      `http://94.72.125.153:8443/deleteContactsByIds/${listId}`,
      {
        idsDelete: ids,
      },
      {
        headers: {
          "Key": userCookie?.value,
        },
      }
    );
    console.log("[Server-Action] Lista de contatos excluída com sucesso");
    return { success: true, data: response.data };
  } catch (error) {
    console.log("[Server-Action] Erro ao excluir lista de contatos", error);
    return { success: false, error: error.response?.data?.message || "Erro ao excluir lista de contatos" };
  } finally {
    revalidateTag('contacts');
  }
}

export async function deleteContactList(listId) {
  console.log("[Server-Action] Excluindo Lista de Contatos");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.delete(
      `http://94.72.125.153:8443/deleteContact/${listId}`,
      {
        headers: {
          "Key": userCookie?.value,
        },
      }
    );
    console.log("[Server-Action] Lista de contatos excluída com sucesso");
    return { success: true, data: response.data };
  } catch (error) {
    console.log("[Server-Action] Erro ao excluir lista de contatos", error);
    return { success: false, error: error.response?.data?.message || "Erro ao excluir lista de contatos" };
  } finally {
    revalidateTag('contacts');
  }
}
