"use client";

import { useAppStore } from "@/lib/store";

export function useSelectedVehicle() {
  const vehicles = useAppStore((s) => s.vehicles);
  const selectedVehicleId = useAppStore((s) => s.selectedVehicleId);
  const setSelectedVehicleId = useAppStore((s) => s.setSelectedVehicleId);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) ?? null;

  return { selectedVehicle, selectedVehicleId, setSelectedVehicleId, vehicles };
}
