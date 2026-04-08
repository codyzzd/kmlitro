"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useAppStore } from "@/lib/store";

interface Props {
  userId: string;
}

export function StoreInitializer({ userId }: Props) {
  const initialize = useAppStore((s) => s.initialize);
  const colorTheme = useAppStore((s) => s.settings.colorTheme);
  const { setTheme } = useTheme();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initialize(userId);
    }
  }, [userId, initialize]);

  // Aplica o tema salvo no Supabase em qualquer página
  useEffect(() => {
    if (colorTheme) {
      setTheme(colorTheme);
    }
  }, [colorTheme, setTheme]);

  return null;
}
