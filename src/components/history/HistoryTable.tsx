"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAppStore } from "@/lib/store";
import { useSelectedVehicle } from "@/hooks/useSelectedVehicle";
import { getFillUpsWithKmL } from "@/lib/calculations";
import { FUEL_TYPE_LABELS } from "@/lib/types";
import type { FillUp } from "@/lib/types";
import { formatNumber, formatKmL } from "@/lib/utils";
import { HistoryFilters } from "./HistoryFilters";
import { EditFillUpDialog } from "./EditFillUpDialog";
import { DeleteFillUpDialog } from "./DeleteFillUpDialog";
import { FillUpForm } from "@/components/fillup/FillUpForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, Gauge, Droplets, Banknote, Fuel } from "lucide-react";

export function HistoryTable() {
  const fillups = useAppStore((s) => s.fillups);
  const decimalSeparator = useAppStore((s) => s.settings.decimalSeparator);
  const { selectedVehicleId } = useSelectedVehicle();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [editingFillUp, setEditingFillUp] = useState<FillUp | null>(null);
  const [deletingFillUp, setDeletingFillUp] = useState<FillUp | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);

  const rows = selectedVehicleId
    ? getFillUpsWithKmL(fillups, selectedVehicleId)
    : [...fillups]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((f) => ({ fillup: f, kmPerLiter: null as number | null }));

  const filtered = rows.filter(({ fillup }) => {
    if (!dateRange?.from) return true;
    const d = new Date(fillup.date);
    const from = new Date(dateRange.from);
    from.setHours(0, 0, 0, 0);
    if (dateRange.to) {
      const to = new Date(dateRange.to);
      to.setHours(23, 59, 59, 999);
      return d >= from && d <= to;
    }
    return d >= from;
  });

  function handleEdit(fillup: FillUp) {
    setEditingFillUp(fillup);
    setEditOpen(true);
  }

  function handleDeleteClick(fillup: FillUp) {
    setDeletingFillUp(fillup);
    setDeleteOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Abastecimentos</h1>
          <p className="text-muted-foreground">Histórico de abastecimentos</p>
        </div>
        <Button onClick={() => setNewOpen(true)} className="hidden lg:flex self-start sm:self-auto">
          <Plus className="h-4 w-4 mr-2" />
          Novo Abastecimento
        </Button>
      </div>

      <HistoryFilters dateRange={dateRange} onDateRangeChange={setDateRange} />

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum registro encontrado.
        </div>
      ) : (
        <>
          {/* Tabela — visível em lg+ */}
          <div className="hidden lg:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data e Hora</TableHead>
                  <TableHead>Odômetro</TableHead>
                  <TableHead>Litros</TableHead>
                  <TableHead>Preço/L</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Combustível</TableHead>
                  <TableHead>km/l</TableHead>
                  <TableHead>Obs</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(({ fillup, kmPerLiter }) => (
                  <TableRow key={fillup.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(fillup.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {fillup.noData
                        ? "—"
                        : `${formatNumber(fillup.odometer, decimalSeparator)} km`}
                    </TableCell>
                    <TableCell>
                      {fillup.noData
                        ? "—"
                        : `${formatNumber(fillup.liters, decimalSeparator, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} L`}
                    </TableCell>
                    <TableCell>
                      {fillup.noData
                        ? "—"
                        : `R$ ${formatNumber(fillup.pricePerLiter, decimalSeparator, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`}
                    </TableCell>
                    <TableCell>
                      {fillup.noData
                        ? "—"
                        : `R$ ${formatNumber(fillup.totalPaid, decimalSeparator, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </TableCell>
                    <TableCell>
                      {fillup.noData ? (
                        <Badge variant="secondary">Sem dados</Badge>
                      ) : (
                        FUEL_TYPE_LABELS[fillup.fuelType]
                      )}
                    </TableCell>
                    <TableCell>
                      {fillup.noData ? (
                        <span className="text-muted-foreground text-xs">ignorado</span>
                      ) : (
                        <span className={kmPerLiter !== null ? "font-medium" : "text-muted-foreground"}>
                          {formatKmL(kmPerLiter, decimalSeparator)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm max-w-32 truncate">
                      {fillup.notes || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(fillup)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(fillup)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Cards — visível em mobile e tablet */}
          <div className="lg:hidden space-y-3">
            {filtered.map(({ fillup, kmPerLiter }) => (
              <Card key={fillup.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">
                          {format(new Date(fillup.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                        {fillup.noData && (
                          <Badge variant="secondary" className="text-xs">Sem dados</Badge>
                        )}
                      </div>

                      {!fillup.noData && kmPerLiter !== null && (
                        <p className="text-base font-semibold mt-1">
                          {formatKmL(kmPerLiter, decimalSeparator)}
                        </p>
                      )}
                      {!fillup.noData && kmPerLiter === null && (
                        <p className="text-sm text-muted-foreground mt-1">km/l não calculado</p>
                      )}

                      {!fillup.noData && (
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-center gap-1.5">
                            <Gauge className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-foreground">{formatNumber(fillup.odometer, decimalSeparator)} km</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Droplets className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-foreground">
                              {formatNumber(fillup.liters, decimalSeparator, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} L
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span>R$ {formatNumber(fillup.pricePerLiter, decimalSeparator, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}/L</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Banknote className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-foreground font-medium">R$ {formatNumber(fillup.totalPaid, decimalSeparator, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Fuel className="h-3.5 w-3.5 shrink-0" />
                            <span>{FUEL_TYPE_LABELS[fillup.fuelType]}</span>
                          </p>
                        </div>
                      )}

                      {fillup.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{fillup.notes}</p>
                      )}
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(fillup)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(fillup)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* FAB — visível em mobile e tablet */}
      <Button
        onClick={() => setNewOpen(true)}
        size="icon"
        className="lg:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
      >
        <Plus className="h-6 w-6" />
      </Button>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Abastecimento</DialogTitle>
          </DialogHeader>
          <FillUpForm onSuccess={() => setNewOpen(false)} />
        </DialogContent>
      </Dialog>

      <EditFillUpDialog open={editOpen} onOpenChange={setEditOpen} fillUp={editingFillUp} />
      <DeleteFillUpDialog open={deleteOpen} onOpenChange={setDeleteOpen} fillUp={deletingFillUp} />
    </div>
  );
}
