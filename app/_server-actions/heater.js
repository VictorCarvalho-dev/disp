"use server";

import Axios from "axios";
import { cookies } from "next/headers";
import { revalidateTag } from 'next/cache';

export async function getHeaters() {
  console.log("[Server-Action] Carregando Aquecimentos");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.get("https://prod.libanoinstituto.com.br/heaterList", {
      headers: {
        "Key": userCookie?.value,
      },
      next: { tags: ['heaters'] }
    });
    console.log("[Server-Action] Aquecimentos carregados com sucesso");
    return response.data.data || [];
  } catch (error) {
    console.log("[Server-Action] Erro ao carregar aquecimentos", error);
    return [];
  }
}

export async function createHeater(data) {
  console.log("[Server-Action] Criando Aquecimento");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.post(
      "https://prod.libanoinstituto.com.br/heater",
      data,
      {
        headers: {
          "Key": userCookie?.value,
        },
      }
    );
    console.log("[Server-Action] Aquecimento criado com sucesso");
    return { success: true, data: response.data };
  } catch (error) {
    console.log("[Server-Action] Erro ao criar aquecimento", error);
    return { success: false, error: error.response?.data?.message || "Erro ao criar aquecimento" };
  } finally {
    revalidateTag('heaters');
  }
}

export async function cancelHeater(id) {
  console.log("[Server-Action] Cancelando Aquecimento");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.put(
      `https://prod.libanoinstituto.com.br/heaterCanceled/${id}`,
      {},
      {
        headers: {
          "Key": userCookie?.value,
        },
      }
    );
    console.log("[Server-Action] Aquecimento cancelado com sucesso");
    return { success: true, data: response.data };
  } catch (error) {
    console.log("[Server-Action] Erro ao cancelar aquecimento", error);
    return { success: false, error: error.response?.data?.message || "Erro ao cancelar aquecimento" };
  } finally {
    revalidateTag('heaters');
  }
}
