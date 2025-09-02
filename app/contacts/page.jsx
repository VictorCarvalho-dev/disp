import { Suspense } from 'react';
import { ContactsTable } from "./_components/contactsTable";
import { UploadContactsModal } from "./_components/uploadContactsModal";
import { getContacts } from "@/app/_server-actions/contacts";

export const dynamic = 'force-dynamic';

async function ContactsContent() {
  let contacts = [];
  let error = null;

  try {
    contacts = await getContacts();
  } catch (err) {
    console.error("Erro ao carregar contatos:", err);
    error = "Erro ao carregar listas de contatos";
  }
  
  if (error) {
    return (
      <div className="text-center text-destructive p-4">
        {error}
      </div>
    );
  }
  
  return <ContactsTable contacts={contacts} isLoading={false} />;
}
export default function ContactsPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Listas de Contatos</h1>
          <p className="text-muted-foreground">
            Gerencie suas listas de contatos para envio de mensagens
          </p>
        </div>
        <Suspense>
          <UploadContactsModal />
        </Suspense>
      </div>

      <div className="rounded-lg border bg-card">
        <Suspense fallback={
          <div className="h-32 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Carregando listas de contatos...
              </p>
            </div>
          </div>
        }>
          <ContactsContent />
        </Suspense>
      </div>
    </div>
  );
}