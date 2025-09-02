"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { statusConnection } from '@/app/_server-actions/connections';

// Número máximo de tentativas de verificação para cada conexão
const MAX_RETRY_ATTEMPTS = 30; // ~5 minutos com intervalo de 10s

/**
 * Hook personalizado para verificar periodicamente o status das conexões
 * @param {Array} connections - Lista de conexões a serem monitoradas
 * @param {boolean} [isQrDialogOpen=false] - Indica se o modal do QR code está aberto
 * @param {number} [interval=2000] - Intervalo de verificação em milissegundos quando o modal está aberto (padrão: 2 segundos)
 * @returns {Object} - Objeto contendo a lista de conexões atualizada e função para forçar atualização
 */
export function useConnectionStatusPolling(connections, isQrDialogOpen = false, interval = 2000) {
  const [connectionsState, setConnectionsState] = useState(connections || []);
  const [isPolling, setIsPolling] = useState(false);
  const retryCountRef = useRef(new Map()); // Rastreia tentativas por connectionId
  const isMounted = useRef(true);

  // Limpa os contadores quando o componente é desmontado
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Função para verificar o status de uma única conexão
  const checkConnectionStatus = useCallback(async (connection) => {
    if (!isMounted.current) return connection;

    try {
      const result = await statusConnection(connection.instanceName);
      
      if (result?.data?.status) {
        const newStatus = result.data.status;
        
        // Se o status mudou, reinicia o contador de tentativas
        if (newStatus !== connection.status) {
          retryCountRef.current.set(connection.instanceName, 0);
          return { ...connection, status: newStatus };
        }
        
        // Incrementa o contador de tentativas
        const currentCount = retryCountRef.current.get(connection.instanceName) || 0;
        retryCountRef.current.set(connection.instanceName, currentCount + 1);
      }
      
      return connection;
    } catch (error) {
      console.error(`Erro ao verificar status da conexão ${connection.instanceName}:`, error);
      return connection;
    }
  }, []);

  // Função para verificar o status de todas as conexões "connecting"
  const checkAllConnections = useCallback(async () => {
    if (!isMounted.current) return;

    const connectingConnections = connectionsState.filter(
      conn => (conn.status === 'connecting' || conn.status === 'open') && 
             (retryCountRef.current.get(conn.instanceName) || 0) < MAX_RETRY_ATTEMPTS
    );

    if (connectingConnections.length === 0) {
      setIsPolling(false);
      return;
    }

    try {
      const updates = await Promise.all(
        connectingConnections.map(conn => checkConnectionStatus(conn))
      );

      if (!isMounted.current) return;

      setConnectionsState(prevConnections => {
        const updatedMap = new Map(updates.map(conn => [conn.instanceName, conn]));
        return prevConnections.map(conn => updatedMap.get(conn.instanceName) || conn);
      });
      
      // Verifica se ainda há conexões em "connecting" para continuar o polling
      const stillConnecting = updates.some(conn => 
        conn.status === 'connecting' && 
        (retryCountRef.current.get(conn.instanceName) || 0) < MAX_RETRY_ATTEMPTS
      );
      
      if (isMounted.current) {
        setIsPolling(stillConnecting);
      }
    } catch (error) {
      console.error('Erro ao verificar status das conexões:', error);
    }
  }, [connectionsState, checkConnectionStatus]);

  // Efeito para iniciar/parar o polling baseado no estado das conexões e no modal
  useEffect(() => {
    if (!isMounted.current) return;
    
    const hasConnecting = connectionsState.some(conn => 
      conn.status === 'connecting' && 
      (retryCountRef.current.get(conn.instanceName) || 0) < MAX_RETRY_ATTEMPTS
    );
    
    // Seta o estado de polling como true se houver conexões em 'connecting' e o modal estiver aberto
    // Caso contrário, mantém o estado atual (não força para false para não interromper se o modal for fechado temporariamente)
    if (hasConnecting && isQrDialogOpen) {
      setIsPolling(true);
    } else if (!hasConnecting) {
      // Só para o polling quando não houver mais conexões para verificar
      setIsPolling(false);
    }
  }, [connectionsState, isQrDialogOpen]);

  // Efeito para gerenciar o intervalo de polling
  useEffect(() => {
    // Só inicia o polling se houver conexões em 'connecting' e o modal do QR estiver aberto
    if (!isPolling || !isQrDialogOpen) return;
    
    let timeoutId;
    
    const executePolling = async () => {
      if (!isMounted.current) return;
      
      await checkAllConnections();
      
      // Continua o polling apenas se o modal ainda estiver aberto e houver conexões para verificar
      if (isMounted.current && isPolling && isQrDialogOpen) {
        timeoutId = setTimeout(executePolling, interval);
      }
    };
    
    // Inicia o polling
    executePolling();
    
    // Limpa o timeout quando o componente é desmontado, quando o polling é desativado ou quando o modal é fechado
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isPolling, interval, checkAllConnections, isQrDialogOpen]);

  // Atualiza o estado quando as conexões iniciais mudam
  useEffect(() => {
    if (!isMounted.current) return;
    
    // Inicializa os contadores para novas conexões
    connections?.forEach(conn => {
      if (!retryCountRef.current.has(conn.instanceName)) {
        retryCountRef.current.set(conn.instanceName, 0);
      }
    });
    
    setConnectionsState(connections || []);
  }, [connections]);

  // Função para forçar uma verificação imediata
  const forceUpdate = useCallback(() => {
    if (isMounted.current) {
      checkAllConnections();
    }
  }, [checkAllConnections]);

  return { connections: connectionsState, forceUpdate };
}
