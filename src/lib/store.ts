import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import type { Vehicle, FillUp, FuelType } from "./types";

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

// ----------------------------------------------------------------
// Helpers de mapeamento snake_case <-> camelCase
// ----------------------------------------------------------------

function rowToVehicle(row: Record<string, unknown>): Vehicle {
  return {
    id: row.id as string,
    nickname: row.nickname as string,
    brand: row.brand as string,
    model: (row.model as string | null) ?? undefined,
    year: row.year as number,
    createdAt: row.created_at as string,
  };
}

function rowToFillUp(row: Record<string, unknown>): FillUp {
  return {
    id: row.id as string,
    vehicleId: row.vehicle_id as string,
    date: row.date as string,
    noData: row.no_data as boolean,
    odometer: (row.odometer as number) ?? 0,
    liters: (row.liters as number) ?? 0,
    pricePerLiter: (row.price_per_liter as number) ?? 0,
    totalPaid: (row.total_paid as number) ?? 0,
    fuelType: row.fuel_type as FuelType,
    fullTank: row.full_tank as boolean,
    notes: (row.notes as string | null) ?? undefined,
  };
}

function rowToSettings(row: Record<string, unknown>): AppSettings {
  return {
    decimalSeparator: (row.decimal_separator as "," | ".") ?? ",",
    colorTheme: (row.color_theme as "system" | "light" | "dark") ?? "system",
    userName: (row.user_name as string) ?? "",
    userEmail: (row.user_email as string) ?? "",
  };
}

// ----------------------------------------------------------------
// Store
// ----------------------------------------------------------------

interface AppState {
  vehicles: Vehicle[];
  fillups: FillUp[];
  selectedVehicleId: string | null;
  defaultVehicleId: string | null;
  settings: AppSettings;
  isLoading: boolean;
  userId: string | null;

  // Inicialização — chama uma vez após login
  initialize: (userId: string) => Promise<void>;

  addVehicle: (data: Omit<Vehicle, "id" | "createdAt">, userId: string) => Promise<void>;
  updateVehicle: (id: string, data: Partial<Omit<Vehicle, "id" | "createdAt">>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  addFillUp: (data: Omit<FillUp, "id">, userId: string) => Promise<void>;
  updateFillUp: (id: string, data: Partial<Omit<FillUp, "id">>) => Promise<void>;
  deleteFillUp: (id: string) => Promise<void>;

  setSelectedVehicleId: (id: string | null) => void;
  setDefaultVehicleId: (id: string | null, userId: string) => Promise<void>;
  updateSettings: (s: Partial<AppSettings>, userId: string) => Promise<void>;
}

export const useAppStore = create<AppState>()((set, get) => ({
  vehicles: [],
  fillups: [],
  selectedVehicleId: null,
  defaultVehicleId: null,
  settings: defaultSettings,
  isLoading: false,
  userId: null,

  // ----------------------------------------------------------------
  // initialize
  // ----------------------------------------------------------------
  initialize: async (userId) => {
    set({ isLoading: true });
    const supabase = createClient();

    const [userRes, vehiclesRes, fillupsRes, settingsRes] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("vehicles").select("*").eq("user_id", userId).order("created_at"),
      supabase.from("fillups").select("*").eq("user_id", userId).order("date"),
      supabase.from("user_settings").select("*").eq("user_id", userId).single(),
    ]);

    const authEmail = userRes.data.user?.email ?? "";
    const vehicles = (vehiclesRes.data ?? []).map(rowToVehicle);
    const fillups = (fillupsRes.data ?? []).map(rowToFillUp);
    const settings = settingsRes.data ? rowToSettings(settingsRes.data) : defaultSettings;
    // Email vem sempre do Auth (fonte autoritativa), não da tabela de settings
    settings.userEmail = authEmail;
    const defaultVehicleId = (settingsRes.data?.default_vehicle_id as string | null) ?? null;

    // Seleciona veículo padrão se não há seleção
    const current = get().selectedVehicleId;
    const selectedVehicleId =
      current && vehicles.find((v) => v.id === current)
        ? current
        : (defaultVehicleId ?? vehicles[0]?.id ?? null);

    set({ vehicles, fillups, settings, defaultVehicleId, selectedVehicleId, isLoading: false, userId });
  },

  // ----------------------------------------------------------------
  // Vehicles
  // ----------------------------------------------------------------
  addVehicle: async (data, userId) => {
    const supabase = createClient();
    const { data: row, error } = await supabase
      .from("vehicles")
      .insert({ ...data, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    const vehicle = rowToVehicle(row);
    set((state) => ({ vehicles: [...state.vehicles, vehicle] }));
  },

  updateVehicle: async (id, data) => {
    const supabase = createClient();
    const { data: row, error } = await supabase
      .from("vehicles")
      .update(data)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    const updated = rowToVehicle(row);
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? updated : v)),
    }));
  },

  deleteVehicle: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) throw error;
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== id),
      fillups: state.fillups.filter((f) => f.vehicleId !== id),
      selectedVehicleId: state.selectedVehicleId === id ? null : state.selectedVehicleId,
      defaultVehicleId: state.defaultVehicleId === id ? null : state.defaultVehicleId,
    }));
  },

  // ----------------------------------------------------------------
  // FillUps
  // ----------------------------------------------------------------
  addFillUp: async (data, userId) => {
    const supabase = createClient();
    const { data: row, error } = await supabase
      .from("fillups")
      .insert({
        vehicle_id: data.vehicleId,
        user_id: userId,
        date: data.date,
        no_data: data.noData,
        odometer: data.odometer ?? null,
        liters: data.liters ?? null,
        price_per_liter: data.pricePerLiter ?? null,
        total_paid: data.totalPaid ?? null,
        fuel_type: data.fuelType,
        full_tank: data.fullTank,
        notes: data.notes ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    const fillup = rowToFillUp(row);
    set((state) => ({ fillups: [...state.fillups, fillup] }));
  },

  updateFillUp: async (id, data) => {
    const supabase = createClient();
    const patch: Record<string, unknown> = {};
    if (data.vehicleId !== undefined) patch.vehicle_id = data.vehicleId;
    if (data.date !== undefined) patch.date = data.date;
    if (data.noData !== undefined) patch.no_data = data.noData;
    if (data.odometer !== undefined) patch.odometer = data.odometer;
    if (data.liters !== undefined) patch.liters = data.liters;
    if (data.pricePerLiter !== undefined) patch.price_per_liter = data.pricePerLiter;
    if (data.totalPaid !== undefined) patch.total_paid = data.totalPaid;
    if (data.fuelType !== undefined) patch.fuel_type = data.fuelType;
    if (data.fullTank !== undefined) patch.full_tank = data.fullTank;
    if (data.notes !== undefined) patch.notes = data.notes;

    const { data: row, error } = await supabase
      .from("fillups")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    const updated = rowToFillUp(row);
    set((state) => ({
      fillups: state.fillups.map((f) => (f.id === id ? updated : f)),
    }));
  },

  deleteFillUp: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("fillups").delete().eq("id", id);
    if (error) throw error;
    set((state) => ({ fillups: state.fillups.filter((f) => f.id !== id) }));
  },

  // ----------------------------------------------------------------
  // Seleção e configurações
  // ----------------------------------------------------------------
  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),

  setDefaultVehicleId: async (id, userId) => {
    const supabase = createClient();
    await supabase
      .from("user_settings")
      .upsert({ user_id: userId, default_vehicle_id: id }, { onConflict: "user_id" });
    set({ defaultVehicleId: id });
  },

  updateSettings: async (s, userId) => {
    const supabase = createClient();
    const patch: Record<string, unknown> = {};
    if (s.decimalSeparator !== undefined) patch.decimal_separator = s.decimalSeparator;
    if (s.colorTheme !== undefined) patch.color_theme = s.colorTheme;
    if (s.userName !== undefined) patch.user_name = s.userName;
    if (s.userEmail !== undefined) patch.user_email = s.userEmail;

    await supabase
      .from("user_settings")
      .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" });

    set((state) => ({ settings: { ...state.settings, ...s } }));
  },
}));
