import type { FillUp } from "./types";

/**
 * Retorna abastecimentos elegíveis: tanque cheio + sem noData, ordenados por odômetro crescente.
 */
export function getEligibleFillUps(fillups: FillUp[], vehicleId: string): FillUp[] {
  return fillups
    .filter((f) => f.vehicleId === vehicleId && f.fullTank && !f.noData)
    .sort((a, b) => a.odometer - b.odometer);
}

/**
 * Calcula km/l entre dois abastecimentos consecutivos elegíveis.
 */
export function calculateKmPerLiter(current: FillUp, previous: FillUp): number | null {
  const diff = current.odometer - previous.odometer;
  if (diff <= 0 || current.liters <= 0) return null;
  return diff / current.liters;
}

/**
 * Retorna todos os abastecimentos do veículo com km/l calculado.
 * Para o histórico: inclui todos os registros, mas km/l só aparece nos elegíveis.
 */
export function getFillUpsWithKmL(
  fillups: FillUp[],
  vehicleId: string
): Array<{ fillup: FillUp; kmPerLiter: number | null }> {
  const vehicleFillUps = fillups
    .filter((f) => f.vehicleId === vehicleId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const eligible = getEligibleFillUps(fillups, vehicleId);

  return vehicleFillUps.map((fillup) => {
    if (fillup.noData || !fillup.fullTank) {
      return { fillup, kmPerLiter: null };
    }
    const idx = eligible.findIndex((e) => e.id === fillup.id);
    if (idx <= 0) {
      return { fillup, kmPerLiter: null };
    }
    const prev = eligible[idx - 1];
    return { fillup, kmPerLiter: calculateKmPerLiter(fillup, prev) };
  });
}

/**
 * Retorna o último odômetro registrado para um veículo (excluindo registros sem dados).
 */
export function getLastOdometer(fillups: FillUp[], vehicleId: string): number | null {
  const recent = fillups
    .filter((f) => f.vehicleId === vehicleId && !f.noData && f.odometer > 0)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return recent.length > 0 ? recent[0].odometer : null;
}

export interface KmLChartPoint {
  label: string; // ex: "Abast. 1"
  kmL: number;
}

export interface MonthlyExpensePoint {
  label: string; // ex: "Set/24"
  total: number;
}

/**
 * Retorna os últimos N pontos de km/l calculados (para chart de linha).
 */
export function getLastKmLPoints(fillups: FillUp[], vehicleId: string, count = 7): KmLChartPoint[] {
  const eligible = getEligibleFillUps(fillups, vehicleId);
  if (eligible.length < 2) return [];

  const points: KmLChartPoint[] = [];
  for (let i = 1; i < eligible.length; i++) {
    const kmL = calculateKmPerLiter(eligible[i], eligible[i - 1]);
    if (kmL !== null) {
      points.push({
        label: `Abast. ${i}`,
        kmL: Math.round(kmL * 100) / 100,
      });
    }
  }
  return points.slice(-count);
}

/**
 * Retorna os últimos N meses com total gasto em combustível (para chart de barras).
 */
export function getMonthlyExpenses(fillups: FillUp[], vehicleId: string, months = 7): MonthlyExpensePoint[] {
  const relevant = fillups.filter((f) => f.vehicleId === vehicleId && !f.noData && f.totalPaid > 0);

  const map = new Map<string, number>();
  for (const f of relevant) {
    const d = new Date(f.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) ?? 0) + f.totalPaid);
  }

  const sorted = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const last = sorted.slice(-months);

  const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return last.map(([key, total]) => {
    const [year, month] = key.split("-");
    return {
      label: `${MONTHS_PT[Number(month) - 1]}/${year.slice(2)}`,
      total: Math.round(total * 100) / 100,
    };
  });
}

export interface DashboardStats {
  lastKmL: number | null;
  bestKmL: number | null;
  worstKmL: number | null;
  averageKmL: number | null;
}

/**
 * Retorna as 4 métricas do dashboard para um veículo.
 */
export function getDashboardStats(fillups: FillUp[], vehicleId: string): DashboardStats {
  const eligible = getEligibleFillUps(fillups, vehicleId);

  if (eligible.length < 2) {
    return { lastKmL: null, bestKmL: null, worstKmL: null, averageKmL: null };
  }

  const values: number[] = [];
  for (let i = 1; i < eligible.length; i++) {
    const kmL = calculateKmPerLiter(eligible[i], eligible[i - 1]);
    if (kmL !== null) values.push(kmL);
  }

  if (values.length === 0) {
    return { lastKmL: null, bestKmL: null, worstKmL: null, averageKmL: null };
  }

  return {
    lastKmL: values[values.length - 1],
    bestKmL: Math.max(...values),
    worstKmL: Math.min(...values),
    averageKmL: values.reduce((a, b) => a + b, 0) / values.length,
  };
}
