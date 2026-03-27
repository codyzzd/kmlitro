"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { settingsSchema, type SettingsFormValues } from "@/lib/schemas";
import { useAppStore } from "@/lib/store";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const THEME_LABELS: Record<string, string> = {
  system: "Sistema (automático)",
  light: "Claro",
  dark: "Escuro",
};

const SEPARATOR_LABELS: Record<string, string> = {
  ",": "Vírgula — 1.234,56 (padrão BR)",
  ".": "Ponto — 1,234.56 (padrão US)",
};

export function ConfiguracaoForm() {
  const { theme, setTheme } = useTheme();
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      decimalSeparator: settings.decimalSeparator,
      colorTheme: settings.colorTheme,
      userName: settings.userName,
      userEmail: settings.userEmail,
    },
  });

  // Sincroniza o tema do next-themes com o store na montagem
  useEffect(() => {
    if (settings.colorTheme && theme !== settings.colorTheme) {
      setTheme(settings.colorTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSubmit(values: SettingsFormValues) {
    updateSettings(values);
    setTheme(values.colorTheme);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-lg">

        {/* Perfil */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Perfil</h2>
            <p className="text-sm text-muted-foreground">
              Seu nome e e-mail aparecem na barra lateral.
            </p>
          </div>

          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="userEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Aparência */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Aparência</h2>
            <p className="text-sm text-muted-foreground">
              Personalize o visual do sistema.
            </p>
          </div>

          <FormField
            control={form.control}
            name="colorTheme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tema de cor</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue>
                        {field.value
                          ? THEME_LABELS[field.value]
                          : <span className="text-muted-foreground">Selecione o tema</span>}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="system">Sistema (automático)</SelectItem>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  &quot;Sistema&quot; acompanha as preferências do seu dispositivo.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Formato de números */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Formato de números</h2>
            <p className="text-sm text-muted-foreground">
              Define o separador decimal exibido nos valores do sistema.
            </p>
          </div>

          <FormField
            control={form.control}
            name="decimalSeparator"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Separador decimal</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue>
                        {field.value
                          ? SEPARATOR_LABELS[field.value]
                          : <span className="text-muted-foreground">Selecione o separador</span>}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value=",">Vírgula — 1.234,56 (padrão BR)</SelectItem>
                    <SelectItem value=".">Ponto — 1,234.56 (padrão US)</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Afeta a exibição de km/l, preços e totais no painel e histórico.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit">Salvar configurações</Button>
      </form>
    </Form>
  );
}
