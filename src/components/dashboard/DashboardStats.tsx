"use client";

import { useAppStore } from "@/lib/store";
import { useSelectedVehicle } from "@/hooks/useSelectedVehicle";
import { getDashboardStats, getLastKmLPoints, getMonthlyExpenses } from "@/lib/calculations";
import { formatKmL } from "@/lib/utils";
import { KpiCard } from "./KpiCard";
import { KmLChart } from "./KmLChart";
import { MonthlyExpenseChart } from "./MonthlyExpenseChart";
import Link from "next/link";
import { TrendingUp, TrendingDown, Gauge, BarChart2 } from "lucide-react";

export function DashboardStats() {
  const fillups = useAppStore((s) => s.fillups);
  const decimalSeparator = useAppStore((s) => s.settings.decimalSeparator);
  const { selectedVehicle, selectedVehicleId, vehicles } = useSelectedVehicle();

  const stats = selectedVehicleId ? getDashboardStats(fillups, selectedVehicleId) : null;
  const hasData = stats && (stats.lastKmL !== null || stats.bestKmL !== null);
  const kmLPoints = selectedVehicleId ? getLastKmLPoints(fillups, selectedVehicleId, 7) : [];
  const monthlyExpenses = selectedVehicleId ? getMonthlyExpenses(fillups, selectedVehicleId, 7) : [];

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
        <>
          <div>
            <h2 className="text-lg font-semibold mb-4">{selectedVehicle.nickname}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Último km/l"
                value={fmt(stats?.lastKmL ?? null)}
                description="Abastecimento mais recente"
                icon={Gauge}
                accent="default"
              />
              <KpiCard
                title="Melhor km/l"
                value={fmt(stats?.bestKmL ?? null)}
                description="Maior eficiência registrada"
                icon={TrendingUp}
                accent="green"
              />
              <KpiCard
                title="Pior km/l"
                value={fmt(stats?.worstKmL ?? null)}
                description="Menor eficiência registrada"
                icon={TrendingDown}
                accent="red"
              />
              <KpiCard
                title="Média km/l"
                value={fmt(stats?.averageKmL ?? null)}
                description="Média histórica"
                icon={BarChart2}
                accent="yellow"
              />
            </div>
          </div>

          {(kmLPoints.length >= 2 || monthlyExpenses.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <KmLChart data={kmLPoints} decimalSeparator={decimalSeparator} />
              <MonthlyExpenseChart data={monthlyExpenses} decimalSeparator={decimalSeparator} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
