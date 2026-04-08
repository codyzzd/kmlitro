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
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete}>
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
