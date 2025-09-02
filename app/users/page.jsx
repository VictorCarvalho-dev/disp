import { Suspense } from 'react';
import { getUsers } from "@/app/_server-actions/users";
import { UsersTable } from "./_components/usersTable";
import { NewUser } from "./_components/newUser";

async function UsersContent() {
    const users = await getUsers();
    return <UsersTable users={users} isLoading={false} />;
}

export default function UsersPage() {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        Usuários
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Gerencie os usuários do sistema
                    </p>
                </div>
                <Suspense>
                    <NewUser />
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
                                            Carregando usuários...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }>
                    <UsersContent />
                </Suspense>
            </div>
        </div>
    );
}