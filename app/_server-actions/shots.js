"use server";

import Axios from "axios";
import { cookies } from "next/headers";
import { revalidateTag } from 'next/cache';


export async function getShots() {
  console.log("[Server-Action] Carregando Disparos");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.get("https://sand.libanoinstituto.com.br/listShots", {
      headers: {
        "Key": userCookie?.value,
      },
      next: { tags: ['shots'] }
    });
    console.log("[Server-Action] Disparos carregados com sucesso");
    return response.data.data || [];
  } catch (error) {
    console.log("[Server-Action] Erro ao carregar Disparos", error);
    return [];
  }
}

export async function sendFile(file) {
  console.log("[Server-Action] Enviando arquivo");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    const response = await Axios.post("https://sand.libanoinstituto.com.br/sendDoc", file, {
      headers: {
        "Key": userCookie?.value
      }
    });
    console.log("[Server-Action] Arquivo enviado com sucesso");
    return response.data.data.url;
  } catch (error) {
    console.log("[Server-Action] Erro ao enviar arquivo", error);
    return null;
  }
}

export async function createShot(shotData) {
  console.log("[Server-Action] Criando disparo");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    
    const payload = {
      contactsId: shotData.contactsId,
      connectionsSelect: shotData.connectionsSelect,
      messages: shotData.messages,
      config: {
        delayFrom: shotData.config.delayFrom || 1,
        delayTo: shotData.config.delayTo || 5,

        blockFrom: shotData.config.delayBlock || 15, 
        blockTo: shotData.config.delayBlock || 30, 


        delayBlockFrom: parseInt(shotData.config.delayBlockFrom) || 0, 
        delayBlockTo: parseInt(shotData.config.delayBlockTo) || 0, 
        start: shotData.config.start || "immediate",
        startTime: shotData.config.startTime || "00:00",
        endTime: shotData.config.endTime || "00:00",
        period: Array.isArray(shotData.config.period) ? shotData.config.period : []
      }
    };
    
    console.log("[Server-Action] Criando disparo com payload:", JSON.stringify(payload, null, 2));

    const response = await Axios.post(
      "https://sand.libanoinstituto.com.br/shots",
      payload,
      {
        headers: {
          "Key": userCookie?.value,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("[Server-Action] Disparo criado com sucesso");
    revalidateTag('shots');
    return { success: true, data: response.data };
  } catch (error) {
    console.error("[Server-Action] Erro ao criar disparo:", error);
    return { 
      success: false, 
      error: error.response?.data?.message || "Erro ao criar disparo" 
    };
  }
}

export async function updateShot(shotId, shotData) {
  console.log("[Server-Action] Atualizando disparo");
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    
    const payload = {
      contactsId: shotData.contactsId,
      connectionsSelect: shotData.connectionsSelect,
      messages: shotData.messages,
      config: {
        delayFrom: shotData.config.delayFrom || 1,
        delayTo: shotData.config.delayTo || 5,
        delayBlock: shotData.config.delayBlock || 15, 
        delayBlockFrom: parseInt(shotData.config.delayBlockFrom) || 0, 
        delayBlockTo: parseInt(shotData.config.delayBlockTo) || 0, 
        start: shotData.config.start || "immediate",
        startTime: shotData.config.startTime || "00:00",
        endTime: shotData.config.endTime || "00:00",
        period: Array.isArray(shotData.config.period) ? shotData.config.period : []
      }
    };
    
    console.log("[Server-Action] Atualizando disparo com payload:", JSON.stringify(payload, null, 2));

    const response = await Axios.put(
      `https://sand.libanoinstituto.com.br/shots/${shotId}`,
      payload,
      {
        headers: {
          "Key": userCookie?.value,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("[Server-Action] Disparo atualizado com sucesso");
    return { success: true, data: response.data };
  } catch (error) {
    console.error("[Server-Action] Erro ao atualizar disparo:", error);
    return { 
      success: false, 
      error: error.response?.data?.message || "Erro ao atualizar disparo" 
    };
  }
  finally {
    revalidateTag('shots');
  }
}

export async function actionShot(shotId, action) {
  console.log(`[Server-Action] ${action} disparo`);
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    
    const response = await Axios.post(
      `https://sand.libanoinstituto.com.br/shooting/${shotId}/${action}`,
      {},
      {
        headers: {
          "Key": userCookie?.value,
        }
      }
    );

    console.log(`[Server-Action] ${action} disparo com sucesso`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`[Server-Action] Erro ao ${action} disparo:`, error);
    return { 
      success: false, 
      error: error.response?.data?.message || `Erro ao ${action} disparo` 
    };
  }
  finally {
    revalidateTag('shots');
  }
}