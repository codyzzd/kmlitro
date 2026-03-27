"use client";

import { useAppStore } from "@/lib/store";
import type { FillUp } from "@/lib/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteFillUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fillUp: FillUp | null;
}

export function DeleteFillUpDialog({ open, onOpenChange, fillUp }: DeleteFillUpDialogProps) {
  const deleteFillUp = useAppStore((s) => s.deleteFillUp);

  function handleDelete() {
    if (fillUp) {
      deleteFillUp(fillUp.id);
      onOpenChange(false);
    }
  }

  const dateLabel = fillUp
    ? format(new Date(fillUp.date), "dd/MM/yyyy HH:mm", { locale: ptBR })
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Abastecimento</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o abastecimento de{" "}
            <strong>{dateLabel}</strong>? Esta ação não pode ser desfeita.
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
