"use client";

import { useAppStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

  const selected = vehicles.find((v) => v.id === value);
  const displayLabel = selected
    ? `${selected.nickname} — ${selected.brand}${selected.model ? ` ${selected.model}` : ""} ${selected.year}`
    : null;

  return (
    <div className="space-y-1">
      <Label>Veículo</Label>
    <Select value={value ?? ""} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger>
        {displayLabel ? (
          <span className="flex flex-1 text-left text-sm truncate">{displayLabel}</span>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
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
    </div>
  );
}
