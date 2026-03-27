"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, type VehicleFormValues } from "@/lib/schemas";
import { useAppStore } from "@/lib/store";
import type { Vehicle } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface VehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle;
}

export function VehicleDialog({ open, onOpenChange, vehicle }: VehicleDialogProps) {
  const addVehicle = useAppStore((s) => s.addVehicle);
  const updateVehicle = useAppStore((s) => s.updateVehicle);
  const userId = useAppStore((s) => s.userId);

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      nickname: "",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
    },
  });

  useEffect(() => {
    if (vehicle) {
      form.reset({
        nickname: vehicle.nickname,
        brand: vehicle.brand,
        model: vehicle.model ?? "",
        year: vehicle.year,
      });
    } else {
      form.reset({ nickname: "", brand: "", model: "", year: new Date().getFullYear() });
    }
  }, [vehicle, form, open]);

  async function onSubmit(values: VehicleFormValues) {
    if (!userId) return;
    if (vehicle) {
      await updateVehicle(vehicle.id, values);
    } else {
      await addVehicle(values, userId);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{vehicle ? "Editar Veículo" : "Novo Veículo"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apelido *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Meu Carro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marca *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Volkswagen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Gol (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ano *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ex: 2020"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{vehicle ? "Salvar" : "Criar"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
