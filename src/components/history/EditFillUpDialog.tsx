"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { fillUpSchema, type FillUpFormValues } from "@/lib/schemas";
import { useAppStore } from "@/lib/store";
import { FUEL_TYPE_LABELS, type FuelType, type FillUp } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

type LastEdited = "price" | "total" | null;

interface EditFillUpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fillUp: FillUp | null;
}

export function EditFillUpDialog({ open, onOpenChange, fillUp }: EditFillUpDialogProps) {
  const updateFillUp = useAppStore((s) => s.updateFillUp);
  const decimalSeparator = useAppStore((s) => s.settings.decimalSeparator);
  const sep = decimalSeparator;
  const lastEditedRef = useRef<LastEdited>(null);

  const form = useForm<FillUpFormValues>({
    resolver: zodResolver(fillUpSchema),
    defaultValues: {
      date: "",
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

  // Preenche o formulário quando o abastecimento muda
  useEffect(() => {
    if (fillUp && open) {
      form.reset({
        date: format(new Date(fillUp.date), "yyyy-MM-dd'T'HH:mm"),
        noData: fillUp.noData,
        odometer: fillUp.noData ? undefined : fillUp.odometer || undefined,
        liters: fillUp.noData ? undefined : fillUp.liters || undefined,
        pricePerLiter: fillUp.noData ? undefined : fillUp.pricePerLiter || undefined,
        totalPaid: fillUp.noData ? undefined : fillUp.totalPaid || undefined,
        fuelType: fillUp.fuelType,
        fullTank: fillUp.fullTank,
        notes: fillUp.notes ?? "",
      });
      lastEditedRef.current = null;
    }
  }, [fillUp, open, form]);

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

  function onSubmit(values: FillUpFormValues) {
    if (!fillUp) return;
    updateFillUp(fillUp.id, {
      date: new Date(values.date).toISOString(),
      noData: values.noData,
      odometer: values.noData ? 0 : (values.odometer ?? 0),
      liters: values.noData ? 0 : (values.liters ?? 0),
      pricePerLiter: values.noData ? 0 : (values.pricePerLiter ?? 0),
      totalPaid: values.noData ? 0 : (values.totalPaid ?? 0),
      fuelType: values.fuelType,
      fullTank: values.noData ? false : values.fullTank,
      notes: values.notes,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Abastecimento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
