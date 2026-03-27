"use client";

import { useAppStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VehicleSelectorProps {
  value: string | null;
  onChange: (id: string) => void;
  placeholder?: string;
}

export function VehicleSelector({
  value,
  onChange,
  placeholder = "Selecione um veículo",
}: VehicleSelectorProps) {
  const vehicles = useAppStore((s) => s.vehicles);

  return (
    <Select value={value ?? ""} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {vehicles.length === 0 ? (
          <SelectItem value="__empty__" disabled>
            Nenhum veículo cadastrado
          </SelectItem>
        ) : (
          vehicles.map((v) => (
            <SelectItem key={v.id} value={v.id}>
              {v.nickname} — {v.brand} {v.model ? `${v.model} ` : ""}{v.year}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
