"use client";

import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface HistoryFiltersProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function HistoryFilters({ dateRange, onDateRangeChange }: HistoryFiltersProps) {
  const [open, setOpen] = useState(false);

  const dateLabel = (() => {
    if (!dateRange?.from) return "Filtrar por data";
    if (!dateRange.to) return format(dateRange.from, "dd/MM/yyyy", { locale: ptBR });
    return `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} – ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
  })();

  return (
    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "inline-flex h-9 w-full sm:w-64 items-center justify-start gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-normal ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            !dateRange?.from && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4" />
          {dateLabel}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={onDateRangeChange}
            locale={ptBR}
            initialFocus
          />
          {dateRange?.from && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  onDateRangeChange(undefined);
                  setOpen(false);
                }}
              >
                Limpar filtro
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
