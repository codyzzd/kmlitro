"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import type { Vehicle } from "@/lib/types";
import { getDashboardStats } from "@/lib/calculations";
import { formatKmL } from "@/lib/utils";
import { VehicleDialog } from "./VehicleDialog";
import { DeleteVehicleDialog } from "./DeleteVehicleDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, Plus, Star, MoreHorizontal } from "lucide-react";

export function VehicleList() {
  const vehicles = useAppStore((s) => s.vehicles);
  const fillups = useAppStore((s) => s.fillups);
  const defaultVehicleId = useAppStore((s) => s.defaultVehicleId);
  const setDefaultVehicleId = useAppStore((s) => s.setDefaultVehicleId);
  const decimalSeparator = useAppStore((s) => s.settings.decimalSeparator);
  const userId = useAppStore((s) => s.userId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | undefined>(undefined);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  function handleEdit(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditingVehicle(undefined);
    setDialogOpen(true);
  }

  function handleDeleteClick(vehicle: Vehicle) {
    setDeletingVehicle(vehicle);
    setDeleteOpen(true);
  }

  function handleSetDefault(vehicle: Vehicle) {
    if (!userId) return;
    setDefaultVehicleId(defaultVehicleId === vehicle.id ? null : vehicle.id, userId);
  }

  return (
    <div>
      {/* Sticky page header */}
      <div className="sticky top-0 z-10 bg-background pt-4 pb-4 mb-6 -mx-4 md:-mx-6 px-4 md:px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold leading-tight flex-1">Veículos</h1>
          <Button onClick={handleNew} className="hidden lg:flex">
            <Plus className="h-4 w-4 mr-2" />
            Novo Veículo
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie seus veículos</p>
      </div>

      <div className="space-y-4">

      {vehicles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum veículo cadastrado. Clique em &quot;Novo Veículo&quot; para começar.
        </div>
      ) : (
        <>
          {/* Tabela — visível em lg+ */}
          <div className="hidden lg:block overflow-x-auto animate-fade-in">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Apelido</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Ano</TableHead>
                  <TableHead>Abast.</TableHead>
                  <TableHead>Último km/l</TableHead>
                  <TableHead>Padrão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => {
                  const count = fillups.filter((f) => f.vehicleId === vehicle.id).length;
                  const isDefault = defaultVehicleId === vehicle.id;
                  const stats = getDashboardStats(fillups, vehicle.id);
                  return (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {vehicle.nickname}
                          {isDefault && (
                            <Badge variant="secondary" className="text-xs">padrão</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{vehicle.brand}</TableCell>
                      <TableCell>{vehicle.model ?? "—"}</TableCell>
                      <TableCell>{vehicle.year}</TableCell>
                      <TableCell>{count}</TableCell>
                      <TableCell className="font-medium text-yellow-600 dark:text-yellow-400">
                        {formatKmL(stats.lastKmL, decimalSeparator)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetDefault(vehicle)}
                          title={isDefault ? "Remover como padrão" : "Definir como padrão"}
                        >
                          <Star
                            className="h-4 w-4"
                            fill={isDefault ? "currentColor" : "none"}
                          />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(vehicle)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Cards — visível em mobile e tablet */}
          <div className="lg:hidden space-y-4">
            {vehicles.map((vehicle, index) => {
              const count = fillups.filter((f) => f.vehicleId === vehicle.id).length;
              const isDefault = defaultVehicleId === vehicle.id;
              const stats = getDashboardStats(fillups, vehicle.id);
              return (
                <Card key={vehicle.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(index, 5) * 80}ms` }}>
                  <CardContent>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Primário: apelido */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-lg font-bold leading-tight">{vehicle.nickname}</span>
                          {isDefault && (
                            <Badge variant="secondary" className="text-xs shrink-0">padrão</Badge>
                          )}
                        </div>

                        {/* Secundário: marca + modelo + ano */}
                        <p className="text-sm text-muted-foreground">
                          {vehicle.brand}{vehicle.model ? ` ${vehicle.model}` : ""} • {vehicle.year}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(vehicle)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSetDefault(vehicle)}>
                            <Star className="mr-2 h-4 w-4" fill={isDefault ? "currentColor" : "none"} />
                            {isDefault ? "Remover padrão" : "Definir como padrão"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteClick(vehicle)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>

                  {/* Terciário: estatísticas no footer nativo */}
                  <CardFooter className="gap-3 text-sm">
                    <span className="text-muted-foreground">{count} abastecimento{count !== 1 ? "s" : ""}</span>
                    {stats.lastKmL !== null && (
                      <>
                        <span className="text-muted-foreground">·</span>
                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                          {formatKmL(stats.lastKmL, decimalSeparator)}
                        </span>
                      </>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </>
      )}

      </div>{/* end space-y-4 */}

      {/* FAB — visível em mobile e tablet */}
      <Button
        onClick={handleNew}
        className="lg:hidden fixed left-0 right-0 z-50 py-6 shadow-lg gap-2 text-base font-semibold"
        style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom))" }}
      >
        <Plus className="h-5 w-5" />
        Novo Veículo
      </Button>

      <VehicleDialog open={dialogOpen} onOpenChange={setDialogOpen} vehicle={editingVehicle} />
      <DeleteVehicleDialog open={deleteOpen} onOpenChange={setDeleteOpen} vehicle={deletingVehicle} />
    </div>
  );
}
