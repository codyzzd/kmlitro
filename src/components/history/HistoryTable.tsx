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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
    <div>
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 bg-background pt-4 pb-4 mb-6 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl font-bold leading-tight flex-1">Abastecimentos</h1>
          <Button onClick={() => setNewOpen(true)} className="hidden lg:flex shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Novo Abastecimento
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <HistoryFilters dateRange={dateRange} onDateRangeChange={setDateRange} />
        </div>
      </div>

      <div className="space-y-4">

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum registro encontrado.
        </div>
      ) : (
        <>
          {/* Tabela — visível em lg+ */}
          <div className="hidden lg:block overflow-x-auto animate-fade-in">
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
                        <span className={kmPerLiter !== null ? "font-medium text-green-500" : "text-muted-foreground"}>
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
          <div className="lg:hidden space-y-4">
            {filtered.map(({ fillup, kmPerLiter }, index) => (
              <Card key={fillup.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 5) * 80}ms` }}>
                <CardContent>
                  {/* Linha 1: data + ações */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(fillup.date), "dd/MM/yyyy • HH:mm", { locale: ptBR })}
                    </span>
                    <div className="flex gap-1 shrink-0 -mr-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(fillup)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteClick(fillup)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {fillup.noData ? (
                    <Badge variant="secondary">Sem dados registrados</Badge>
                  ) : (
                    <>
                      {/* Linha 2: km/l — métrica principal */}
                      <div className="flex items-baseline gap-1.5 mb-1">
                        {kmPerLiter !== null ? (
                          <>
                            <span className="text-2xl font-bold leading-none text-yellow-600 dark:text-yellow-400">
                              {formatKmL(kmPerLiter, decimalSeparator)}
                            </span>
                            <span className="text-xs text-muted-foreground">km/l</span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">km/l não calculado</span>
                        )}
                      </div>

                      {/* Linha 3: total pago — métrica secundária */}
                      <p className="text-base font-semibold">
                        R$ {formatNumber(fillup.totalPaid, decimalSeparator, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </>
                  )}
                </CardContent>

                {!fillup.noData && (
                  <CardFooter className="flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Gauge className="h-3 w-3 shrink-0" />
                      {formatNumber(fillup.odometer, decimalSeparator)} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3 w-3 shrink-0" />
                      {formatNumber(fillup.liters, decimalSeparator, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} L
                    </span>
                    <span className="flex items-center gap-1">
                      <Banknote className="h-3 w-3 shrink-0" />
                      R$ {formatNumber(fillup.pricePerLiter, decimalSeparator, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}/L
                    </span>
                    <span className="flex items-center gap-1">
                      <Fuel className="h-3 w-3 shrink-0" />
                      {FUEL_TYPE_LABELS[fillup.fuelType]}
                    </span>
                    {fillup.notes && (
                      <span className="w-full italic">{fillup.notes}</span>
                    )}
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      </div>{/* end space-y-4 */}

      {/* FAB — visível em mobile e tablet */}
      <Button
        onClick={() => setNewOpen(true)}
        className="lg:hidden fixed left-0 right-0 z-50 py-6 shadow-lg gap-2 text-base font-semibold"
        style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom))" }}
      >
        <Plus className="h-5 w-5" />
        Novo Abastecimento
      </Button>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Abastecimento</DialogTitle>
          </DialogHeader>
          <FillUpForm onSuccess={() => setNewOpen(false)} onCancel={() => setNewOpen(false)} />
        </DialogContent>
      </Dialog>

      <EditFillUpDialog open={editOpen} onOpenChange={setEditOpen} fillUp={editingFillUp} />
      <DeleteFillUpDialog open={deleteOpen} onOpenChange={setDeleteOpen} fillUp={deletingFillUp} />
    </div>
  );
}
