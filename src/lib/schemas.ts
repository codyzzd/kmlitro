import { z } from "zod";

export const vehicleSchema = z.object({
  nickname: z.string().min(1, "Apelido é obrigatório"),
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().optional(),
  year: z
    .number()
    .int()
    .min(1900, "Ano muito antigo")
    .max(new Date().getFullYear() + 1, "Ano inválido"),
});

export type VehicleFormValues = z.infer<typeof vehicleSchema>;

export const fillUpSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  noData: z.boolean(),
  odometer: z.number().optional(),
  liters: z.number().optional(),
  pricePerLiter: z.number().positive("Preço por litro é obrigatório").optional(),
  totalPaid: z.number().positive("Total pago é obrigatório").optional(),
  fuelType: z.enum(["gasoline", "ethanol", "diesel", "gnv"]),
  fullTank: z.boolean(),
  notes: z.string().optional(),
});

export type FillUpFormValues = z.infer<typeof fillUpSchema>;

export const settingsSchema = z.object({
  decimalSeparator: z.enum([",", "."]),
  colorTheme: z.enum(["system", "light", "dark"]),
  userName: z.string(),
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;
