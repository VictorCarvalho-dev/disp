import DashClient from "./_components/DashClient";
import { getActiveConnections } from '@/app/_server-actions/dashboard';
import { getConnections } from '@/app/_server-actions/connections';

export default async function Dashboard() {
  const connections = await getActiveConnections();
  const totalConnections = await getConnections();
  return (
    <DashClient connections={connections.length} totalConnections={totalConnections.length} />
  );
}