"use client";

import { useAppStore } from "@/lib/store";
import { useSelectedVehicle } from "@/hooks/useSelectedVehicle";
import { getDashboardStats } from "@/lib/calculations";
import { formatKmL } from "@/lib/utils";
import { KpiCard } from "./KpiCard";
import Link from "next/link";

export function DashboardStats() {
  const fillups = useAppStore((s) => s.fillups);
  const decimalSeparator = useAppStore((s) => s.settings.decimalSeparator);
  const { selectedVehicle, selectedVehicleId, vehicles } = useSelectedVehicle();

  const stats = selectedVehicleId ? getDashboardStats(fillups, selectedVehicleId) : null;
  const hasData = stats && (stats.lastKmL !== null || stats.bestKmL !== null);

  const fmt = (v: number | null) => formatKmL(v, decimalSeparator);

  return (
    <div className="space-y-6">
      {vehicles.length === 0 && (
        <p className="text-muted-foreground">
          Nenhum veículo cadastrado. Vá em{" "}
          <Link href="/vehicles" className="underline">
            Veículos
          </Link>{" "}
          para começar.
        </p>
      )}

      {vehicles.length > 0 && !selectedVehicle && (
        <p className="text-muted-foreground">
          Selecione um veículo na barra lateral para ver os dados.
        </p>
      )}

      {selectedVehicle && !hasData && (
        <p className="text-muted-foreground">
          Sem dados suficientes para calcular km/l. São necessários pelo menos 2
          abastecimentos com tanque cheio.
        </p>
      )}

      {selectedVehicle && (
        <div>
          <h2 className="text-lg font-semibold mb-4">{selectedVehicle.nickname}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Último km/l"
              value={fmt(stats?.lastKmL ?? null)}
              description="Abastecimento mais recente"
            />
            <KpiCard
              title="Melhor km/l"
              value={fmt(stats?.bestKmL ?? null)}
              description="Maior eficiência registrada"
            />
            <KpiCard
              title="Pior km/l"
              value={fmt(stats?.worstKmL ?? null)}
              description="Menor eficiência registrada"
            />
            <KpiCard
              title="Média km/l"
              value={fmt(stats?.averageKmL ?? null)}
              description="Média histórica"
            />
          </div>
        </div>
      )}
    </div>
  );
}
