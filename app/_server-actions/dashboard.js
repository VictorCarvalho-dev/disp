"use server"

import Axios from "axios";
import { cookies } from "next/headers";

export async function getActiveConnections() {
  console.log("[Server-Action] Carregando conexões ativas");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.get("https://pro.libanoinstituto.com.br/listConnections/active", {
      headers: {
        "Key": userCookie?.value,
      },
      next: { tags: ['connections-dash'] }
    });
    console.log("[Server-Action] Conexões ativas carregadas com sucesso");
    return response.data.data || [];
  } catch (error) {
    console.log("[Server-Action] Erro ao carregar conexões ativas", error);
    return [];
  }
}

export async function postShots(start, end) {
  console.log("[Server-Action] Carregando disparos na data selecionada", { start, end });
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    
    const formatDate = (date) => {
      const d = new Date(date);
      return d.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
    };

    const requestBody = {
      start: formatDate(start),
      end: formatDate(end)
    };

    const response = await Axios.post("https://pro.libanoinstituto.com.br/dashShots", requestBody, {
      headers: {
        "Content-Type": "application/json",
        "Key": userCookie?.value,
      },
      next: { tags: ['shots-dash'] }
    });
    
    const { data } = response.data;
    return {
      total: data?.total || 0,
      media: data?.media || 0,
      disparos: data?.disparos || 0,
      tabel: data?.tabel || [],
      grafico: data?.grafico || []
    };

  } catch (error) {
    console.error("[Server-Action] Erro ao carregar Disparos:", error.response?.data || error.message);
    return [];
  }
}
