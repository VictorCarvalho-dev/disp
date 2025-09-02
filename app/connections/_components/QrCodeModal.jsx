"use client";

import { useState, useEffect } from "react";
import { statusConnection } from "@/app/_server-actions/connections";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

export function QrCodeModal({ 
  isOpen, 
  onOpenChange, 
  qrCode, 
  connectionId,
  connectionName 
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    if (!isOpen || !connectionId) return;

    console.log('Starting connection status polling for:', connectionId);
    let isMounted = true;
    let timeoutId;

    const checkStatus = async () => {
      if (!isMounted) return;
      
      try {
        console.log('Checking connection status...');
        const result = await statusConnection(connectionId);
        console.log('Connection status response:', result);
        
        const isConnected = result?.data?.instance?.state === 'open';
        
        if (isConnected) {
          console.log('Connection successful');
          setIsConnected(true);
          
          // Close the modal after 2 seconds
          timeoutId = setTimeout(() => {
            if (isMounted) {
              onOpenChange(false);
              setIsConnected(false);
            }
          }, 2000);
          return;
        }
      } catch (error) {
        console.error('Error checking connection status:', error);
      }
      
      // Schedule next check if still mounted and modal is open
      if (isMounted && isOpen) {
        timeoutId = setTimeout(checkStatus, 2000);
      }
    };

    // Start the polling
    checkStatus();

    // Cleanup function
    return () => {
      console.log('Cleaning up connection status polling');
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOpen, connectionId, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{isConnected ? 'Conectado!' : 'Escanear QR Code'}</span>
            
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-4">
          {isConnected ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Conectado com sucesso!</h3>
              <p className="mt-2 text-sm text-gray-500">A conexão foi estabelecida com sucesso.</p>
            </div>
          ) : qrCode ? (
            <div className="text-center">
              <div className="p-4 bg-white rounded-lg">
                <img 
                  src={qrCode} 
                  alt="QR Code" 
                  className="w-64 h-64 object-contain"
                />
              </div>
              <p className="mt-4 text-sm text-gray-600">
                {connectionName || 'Conexão sem nome'}
              </p>
              <p className="mt-2 text-sm text-gray-500">Escaneie o QR Code com seu WhatsApp</p>
            </div>
          ) : (
            <div className="flex items-center justify-center w-64 h-64 bg-gray-100 rounded-lg">
              <p className="text-gray-500">QR Code não disponível</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
