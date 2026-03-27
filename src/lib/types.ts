export type FuelType = "gasoline" | "ethanol" | "diesel" | "gnv";

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  gasoline: "Gasolina",
  ethanol: "Álcool",
  diesel: "Diesel",
  gnv: "GNV",
};

export interface Vehicle {
  id: string;
  nickname: string;
  brand: string;
  model?: string;
  year: number;
  createdAt: string;
}

export interface FillUp {
  id: string;
  vehicleId: string;
  date: string;
  noData: boolean;
  odometer: number;
  liters: number;
  pricePerLiter: number;
  totalPaid: number;
  fuelType: FuelType;
  fullTank: boolean;
  notes?: string;
}
