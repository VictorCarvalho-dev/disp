import { Suspense } from 'react';
import { ChecksTable } from "./_components/checksTable";
import { UploadCheckModal } from "./_components/uploadCheckModal";
import { getChecks } from "@/app/_server-actions/check";

export const dynamic = 'force-dynamic';

async function ChecksContent() {
  let checks = [];
  let error = null;

  try {
    checks = await getChecks();
  } catch (err) {
    console.error("Erro ao carregar verificações:", err);
    error = "Erro ao carregar as verificações";
  }
  
  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        {error}
      </div>
    );
  }
  
  return <ChecksTable checks={checks} isLoading={false} />;
}

export default function CheckPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Verificações</h1>
          <p className="text-muted-foreground">
            Acompanhe o status das suas verificações de contatos
          </p>
        </div>
        <Suspense>
          <UploadCheckModal />
        </Suspense>
      </div>

      <div className="rounded-lg border bg-card">
        <Suspense fallback={
          <div className="h-32 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Carregando verificações...
              </p>
            </div>
          </div>
        }>
          <ChecksContent />
        </Suspense>
      </div>
    </div>
  );
}