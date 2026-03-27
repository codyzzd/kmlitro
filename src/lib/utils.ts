import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formata um número com o separador decimal configurado pelo usuário.
 * separator "," → usa locale pt-BR (ex: 1.234,56)
 * separator "." → usa locale en-US (ex: 1,234.56)
 */
export function formatNumber(
  value: number,
  separator: "," | ".",
  options?: Intl.NumberFormatOptions
): string {
  const locale = separator === "," ? "pt-BR" : "en-US";
  return value.toLocaleString(locale, options);
}

/**
 * Formata um valor monetário (R$) com o separador configurado.
 */
export function formatCurrency(value: number, separator: "," | "."): string {
  return formatNumber(value, separator, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Formata km/l com 2 casas decimais.
 */
export function formatKmL(value: number | null, separator: "," | "."): string {
  if (value === null) return "—";
  return formatNumber(value, separator, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " km/l";
}
