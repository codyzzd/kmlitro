"use client";

import { useAppStore } from "@/lib/store";
import type { Vehicle } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
}

export function DeleteVehicleDialog({ open, onOpenChange, vehicle }: DeleteVehicleDialogProps) {
  const deleteVehicle = useAppStore((s) => s.deleteVehicle);

  function handleDelete() {
    if (vehicle) {
      deleteVehicle(vehicle.id);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Veículo</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir <strong>{vehicle?.nickname}</strong>? Todos os
            registros de abastecimento deste veículo também serão removidos. Esta ação não
            pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Excluir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
