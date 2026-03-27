import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { Vehicle, FillUp } from "./types";

export interface AppSettings {
  decimalSeparator: "," | ".";
  colorTheme: "system" | "light" | "dark";
  userName: string;
  userEmail: string;
}

const defaultSettings: AppSettings = {
  decimalSeparator: ",",
  colorTheme: "system",
  userName: "",
  userEmail: "",
};

interface AppState {
  vehicles: Vehicle[];
  fillups: FillUp[];
  selectedVehicleId: string | null;
  defaultVehicleId: string | null;
  settings: AppSettings;

  addVehicle: (data: Omit<Vehicle, "id" | "createdAt">) => void;
  updateVehicle: (id: string, data: Partial<Omit<Vehicle, "id" | "createdAt">>) => void;
  deleteVehicle: (id: string) => void;

  addFillUp: (data: Omit<FillUp, "id">) => void;
  updateFillUp: (id: string, data: Partial<Omit<FillUp, "id">>) => void;
  deleteFillUp: (id: string) => void;

  setSelectedVehicleId: (id: string | null) => void;
  setDefaultVehicleId: (id: string | null) => void;
  updateSettings: (s: Partial<AppSettings>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      vehicles: [],
      fillups: [],
      selectedVehicleId: null,
      defaultVehicleId: null,
      settings: defaultSettings,

      addVehicle: (data) =>
        set((state) => ({
          vehicles: [
            ...state.vehicles,
            { ...data, id: nanoid(), createdAt: new Date().toISOString() },
          ],
        })),

      updateVehicle: (id, data) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...data } : v)),
        })),

      deleteVehicle: (id) =>
        set((state) => ({
          vehicles: state.vehicles.filter((v) => v.id !== id),
          fillups: state.fillups.filter((f) => f.vehicleId !== id),
          selectedVehicleId: state.selectedVehicleId === id ? null : state.selectedVehicleId,
          defaultVehicleId: state.defaultVehicleId === id ? null : state.defaultVehicleId,
        })),

      addFillUp: (data) =>
        set((state) => ({
          fillups: [...state.fillups, { ...data, id: nanoid() }],
        })),

      updateFillUp: (id, data) =>
        set((state) => ({
          fillups: state.fillups.map((f) => (f.id === id ? { ...f, ...data } : f)),
        })),

      deleteFillUp: (id) =>
        set((state) => ({
          fillups: state.fillups.filter((f) => f.id !== id),
        })),

      setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),
      setDefaultVehicleId: (id) => set({ defaultVehicleId: id }),
      updateSettings: (s) =>
        set((state) => ({ settings: { ...state.settings, ...s } })),
    }),
    { name: "kmlitro-storage" }
  )
);
