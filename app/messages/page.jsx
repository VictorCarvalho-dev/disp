"use client";

import { Suspense, useState, useEffect } from "react";
import { ShotsTable } from "./_components/shotsTable";
import { AddShot } from "./_components/addShot";
import { getShots } from "@/app/_server-actions/shots";

export default function MessagesPage() {
  const [shots, setShots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadShots = async () => {
    try {
      setIsLoading(true);
      const data = await getShots();
      setShots(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading shots:', error);
      setShots([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShots();
  }, []);

  const handleDeleteShot = async (shotId) => {
    try {
      // TODO: Replace with actual delete API call
      console.log('Deleting shot:', shotId);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // Refresh the shots list
      await loadShots();
      return { success: true };
    } catch (error) {
      console.error('Error deleting shot:', error);
      return { success: false, error: 'Failed to delete shot' };
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Disparos de Mensagens
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gerencie seus disparos de mensagens
          </p>
        </div>
        <Suspense>
          <AddShot onShotCreated={loadShots} />
        </Suspense>
      </div>
      
      <div className="mt-6">
        <Suspense fallback={
          <div className="h-32 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Carregando disparos...
              </p>
            </div>
          </div>
        }>
          <ShotsTable 
            shots={shots} 
            onDeleteShot={handleDeleteShot}
            isLoading={isLoading}
            onAction={loadShots}
          />
        </Suspense>
      </div>
    </div>
  );
}
