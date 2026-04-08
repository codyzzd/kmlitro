"use client";

import { useAppStore } from "@/lib/store";
import { useSelectedVehicle } from "@/hooks/useSelectedVehicle";
import { getDashboardStats, getLastKmLPoints, getMonthlyExpenses } from "@/lib/calculations";
import { formatKmL } from "@/lib/utils";
import { KpiCard } from "./KpiCard";
import { KmLChart } from "./KmLChart";
import { MonthlyExpenseChart } from "./MonthlyExpenseChart";
import { VehicleSelector } from "@/components/shared/VehicleSelector";
import Link from "next/link";
import { TrendingUp, TrendingDown, Gauge, BarChart2 } from "lucide-react";

export function DashboardStats() {
  const fillups = useAppStore((s) => s.fillups);
  const decimalSeparator = useAppStore((s) => s.settings.decimalSeparator);
  const { selectedVehicle, selectedVehicleId, vehicles } = useSelectedVehicle();

  const setSelectedVehicleId = useAppStore((s) => s.setSelectedVehicleId);
  const stats = selectedVehicleId ? getDashboardStats(fillups, selectedVehicleId) : null;
  const hasData = stats && (stats.lastKmL !== null || stats.bestKmL !== null);
  const kmLPoints = selectedVehicleId ? getLastKmLPoints(fillups, selectedVehicleId, 7) : [];
  const monthlyExpenses = selectedVehicleId ? getMonthlyExpenses(fillups, selectedVehicleId, 7) : [];

  const fmt = (v: number | null) => formatKmL(v, decimalSeparator);

  return (
    <div className="space-y-6">
      {vehicles.length > 0 && (
        <div className="md:hidden">
          <VehicleSelector
            value={selectedVehicleId}
            onChange={setSelectedVehicleId}
          />
        </div>
      )}

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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Último km/l"
                value={fmt(stats?.lastKmL ?? null)}
                icon={Gauge}
                accent="default"
                index={0}
              />
              <KpiCard
                title="Melhor km/l"
                value={fmt(stats?.bestKmL ?? null)}
                icon={TrendingUp}
                accent="green"
                index={1}
              />
              <KpiCard
                title="Pior km/l"
                value={fmt(stats?.worstKmL ?? null)}
                icon={TrendingDown}
                accent="red"
                index={2}
              />
              <KpiCard
                title="Média km/l"
                value={fmt(stats?.averageKmL ?? null)}
                icon={BarChart2}
                accent="yellow"
                index={3}
              />
            </div>
          </div>

          {(kmLPoints.length >= 2 || monthlyExpenses.length > 0) && (
            <div
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in"
              style={{ animationDelay: "360ms" }}
            >
              <KmLChart data={kmLPoints} decimalSeparator={decimalSeparator} />
              <MonthlyExpenseChart data={monthlyExpenses} decimalSeparator={decimalSeparator} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
