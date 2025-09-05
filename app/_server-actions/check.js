"use server";

import { cookies } from "next/headers";
import { revalidateTag } from 'next/cache';
import Axios from "axios";


export async function getChecks() {
  console.log("[Server-Action] Carregando Checks");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    
    const response = await fetch("https://sand.libanoinstituto.com.br/listContactsCheck", {
      headers: {
        "Key": userCookie?.value || "",
      },
      next: { tags: ['contacts-check'], revalidate: 15 },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("[Server-Action] Checks carregados com sucesso");
    return data.data || [];
  } catch (error) {
    console.log("[Server-Action] Erro ao carregar checks", error);
    return [];
  }
}

export async function createCheck(data, name) {
  console.log("[Server-Action] Criando Check");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.post(
      `https://sand.libanoinstituto.com.br/uploadContactsCheck/${name}`,
      data,
      {
        headers: {
          "Key": userCookie?.value,
        },
      }
    );
    console.log("[Server-Action] Check criado com sucesso");
    return { success: true, data: response.data };
  } catch (error) {
    console.log("[Server-Action] Erro ao criar check", error);
    return { success: false, error: error.response?.data?.message || "Erro ao criar check" };
  } finally {
    revalidateTag('contacts-check');
  }
}

export async function cancelCheck(checkId) {
  console.log("[Server-Action] Cancelando Check");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.post(
      `https://sand.libanoinstituto.com.br/contactsCheck/${checkId}/canceled`,
      {},
      {
        headers: {
          "Key": userCookie?.value,
        },
      }
    );
    console.log("[Server-Action] Check cancelado com sucesso");
    return { success: true, data: response.data };
  } catch (error) {
    console.log("[Server-Action] Erro ao cancelar check", error);
    return { success: false, error: error.response?.data?.message || "Erro ao cancelar check" };
  } finally {
    revalidateTag('contacts-check');
  }
}

export async function downloadCSV(checkId) {
  console.log("[Server-Action] Baixando CSV");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.get(
      `https://sand.libanoinstituto.com.br/downloadCheckCSV/${checkId}`,
      {
        headers: {
          "Key": userCookie?.value,
        },
      }
    );
    console.log("[Server-Action] CSV baixado com sucesso");
    return { success: true, data: response.data };
  } catch (error) {
    console.log("[Server-Action] Erro ao baixar csv", error);
    return { success: false, error: error.response?.data?.message || "Erro ao baixar csv" };
  } finally {
    revalidateTag('contacts-check');
  }
}