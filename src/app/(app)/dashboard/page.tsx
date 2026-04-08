import { DashboardStats } from "@/components/dashboard/DashboardStats";

export default function DashboardPage() {
  return (
    <div>
      <div className="sticky top-0 z-10 bg-background pt-4 pb-4 mb-6 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div>
            <h1 className="text-2xl font-bold leading-tight">Painel</h1>
            <p className="text-sm text-muted-foreground">Acompanhe a performance do seu veículo</p>
          </div>
        </div>
      </div>
      <DashboardStats />
    </div>
  );
}
