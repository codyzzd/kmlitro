import { DashboardStats } from "@/components/dashboard/DashboardStats";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel</h1>
        <p className="text-muted-foreground">Acompanhe a performance do seu veículo</p>
      </div>
      <DashboardStats />
    </div>
  );
}
