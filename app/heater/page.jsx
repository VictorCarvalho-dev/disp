import { Suspense } from 'react';
import { getHeaters } from "@/app/_server-actions/heater";
import { getConnections } from "@/app/_server-actions/connections";
import { HeaterTable } from "./_components/heaterTable";
import { AddHeater } from "./_components/addHeater";
import { getHeaterConnections } from "@/app/_server-actions/connections";
import { getActiveConnections } from "@/app/_server-actions/connections";

export const dynamic = 'force-dynamic';

async function HeaterContent() {
  const heaters = await getHeaters()

  return (
    <HeaterTable 
      heaters={heaters} 
      isLoading={false}
    />
  );
}

export default async function HeaterPage() {
  const connections = await getConnections();
  const heaterConnections = await getHeaterConnections();
  const activeConnections = await getActiveConnections();
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Aquecimento de Números
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gerencie o aquecimento dos números do WhatsApp
          </p>
        </div>
        <Suspense>
          <AddHeater connections={connections} heaterConnections={heaterConnections} activeConnections={activeConnections} />
        </Suspense>
      </div>
      
      <div className="mt-6">
        <Suspense fallback={
          <div className="w-full overflow-hidden rounded-lg border">
            <div className="relative w-full overflow-x-auto">
              <div className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <div className="h-32 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Carregando aquecimentos...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }>
          <HeaterContent />
        </Suspense>
      </div>
    </div>
  );
}