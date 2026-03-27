"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fillUpSchema, type FillUpFormValues } from "@/lib/schemas";
import { useAppStore } from "@/lib/store";
import { useSelectedVehicle } from "@/hooks/useSelectedVehicle";
import { FUEL_TYPE_LABELS, type FuelType } from "@/lib/types";
import { getLastOdometer } from "@/lib/calculations";
import { formatNumber } from "@/lib/utils";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

type LastEdited = "price" | "total" | null;

interface FillUpFormProps {
  onSuccess?: () => void;
}

export function FillUpForm({ onSuccess }: FillUpFormProps = {}) {
  const addFillUp = useAppStore((s) => s.addFillUp);
  const fillups = useAppStore((s) => s.fillups);
  const decimalSeparator = useAppStore((s) => s.settings.decimalSeparator);
  const userId = useAppStore((s) => s.userId);
  const sep = decimalSeparator;

  const { selectedVehicle, selectedVehicleId } = useSelectedVehicle();
  const lastEditedRef = useRef<LastEdited>(null);
  const [submitted, setSubmitted] = useState(false);

  const lastOdometer = selectedVehicleId
    ? getLastOdometer(fillups, selectedVehicleId)
    : null;

  const now = format(new Date(), "yyyy-MM-dd'T'HH:mm");

  const form = useForm<FillUpFormValues>({
    resolver: zodResolver(fillUpSchema),
    defaultValues: {
      date: now,
      noData: false,
      odometer: undefined,
      liters: undefined,
      pricePerLiter: undefined,
      totalPaid: undefined,
      fuelType: "gasoline",
      fullTank: true,
      notes: "",
    },
  });

  const noData = form.watch("noData");
  const liters = form.watch("liters");
  const pricePerLiter = form.watch("pricePerLiter");
  const totalPaid = form.watch("totalPaid");
  const fuelType = form.watch("fuelType");

  // Cálculo bidirecional: preço ↔ total
  useEffect(() => {
    if (!liters || liters <= 0) return;

    if (lastEditedRef.current === "price" && pricePerLiter && pricePerLiter > 0) {
      const calculated = +(pricePerLiter * liters).toFixed(2);
      if (calculated !== totalPaid) {
        form.setValue("totalPaid", calculated, { shouldValidate: false });
      }
    } else if (lastEditedRef.current === "total" && totalPaid && totalPaid > 0) {
      const calculated = +(totalPaid / liters).toFixed(4);
      if (calculated !== pricePerLiter) {
        form.setValue("pricePerLiter", calculated, { shouldValidate: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liters, pricePerLiter, totalPaid]);

  async function onSubmit(values: FillUpFormValues) {
    if (!selectedVehicleId || !userId) return;
    await addFillUp({
      vehicleId: selectedVehicleId,
      date: new Date(values.date).toISOString(),
      noData: values.noData,
      odometer: values.noData ? 0 : (values.odometer ?? 0),
      liters: values.noData ? 0 : (values.liters ?? 0),
      pricePerLiter: values.noData ? 0 : (values.pricePerLiter ?? 0),
      totalPaid: values.noData ? 0 : (values.totalPaid ?? 0),
      fuelType: values.fuelType,
      fullTank: values.noData ? false : values.fullTank,
      notes: values.notes,
    }, userId);
    if (onSuccess) {
      onSuccess();
    } else {
      setSubmitted(true);
    }
    form.reset({
      date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      noData: false,
      odometer: undefined,
      liters: undefined,
      pricePerLiter: undefined,
      totalPaid: undefined,
      fuelType: values.fuelType,
      fullTank: true,
      notes: "",
    });
    lastEditedRef.current = null;
    if (!onSuccess) {
      setTimeout(() => setSubmitted(false), 3000);
    }
  }

  if (!selectedVehicleId) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
        <p>Nenhum veículo selecionado.</p>
        <p className="text-sm mt-1">
          Selecione um veículo na barra lateral ou{" "}
          <Link href="/vehicles" className="underline">
            cadastre um veículo
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
        {submitted && (
          <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-green-800 text-sm dark:bg-green-950 dark:border-green-800 dark:text-green-300">
            Abastecimento registrado com sucesso para <strong>{selectedVehicle?.nickname}</strong>!
          </div>
        )}

        {/* Veículo ativo (informativo) */}
        <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
          Veículo: <span className="font-medium text-foreground">{selectedVehicle?.nickname}</span>
          {" — "}
          <span className="text-xs">troque na barra lateral</span>
        </div>

        {/* Data e hora */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data e Hora *</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Toggle sem dados */}
        <FormField
          control={form.control}
          name="noData"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-3">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div>
                  <Label>Abastecimento sem dados</Label>
                  <p className="text-xs text-muted-foreground">
                    Registra que houve abastecimento, mas ignora nos cálculos de km/l
                  </p>
                </div>
              </div>
            </FormItem>
          )}
        />

        {!noData && (
          <>
            <Separator />

            {/* Odômetro */}
            <FormField
              control={form.control}
              name="odometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odômetro (km) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ex: 45230"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                      }
                    />
                  </FormControl>
                  {lastOdometer !== null && (
                    <p className="text-xs text-muted-foreground">
                      Último registrado: {formatNumber(lastOdometer, sep)} km
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Litros */}
            <FormField
              control={form.control}
              name="liters"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Litros abastecidos *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder={`Ex: 40${sep}5`}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preço por litro */}
            <FormField
              control={form.control}
              name="pricePerLiter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço por litro (R$) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder={`Ex: 5${sep}89`}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        lastEditedRef.current = "price";
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Total pago */}
            <FormField
              control={form.control}
              name="totalPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total pago (R$) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={`Ex: 238${sep}50`}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        lastEditedRef.current = "total";
                        field.onChange(e.target.value === "" ? undefined : Number(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de combustível */}
            <FormField
              control={form.control}
              name="fuelType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de combustível *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue>
                          {fuelType
                            ? FUEL_TYPE_LABELS[fuelType as FuelType]
                            : <span className="text-muted-foreground">Selecione o combustível</span>}
                        </SelectValue>
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(FUEL_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tanque cheio */}
            <FormField
              control={form.control}
              name="fullTank"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-3">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div>
                      <Label>Tanque cheio</Label>
                      <p className="text-xs text-muted-foreground">
                        Necessário para cálculo preciso de km/l
                      </p>
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </>
        )}

        {/* Observação */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação</FormLabel>
              <FormControl>
                <Input placeholder="Opcional..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Registrar Abastecimento
        </Button>
      </form>
    </Form>
  );
}
