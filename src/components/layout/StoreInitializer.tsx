"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";

interface Props {
  userId: string;
}

export function StoreInitializer({ userId }: Props) {
  const initialize = useAppStore((s) => s.initialize);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initialize(userId);
    }
  }, [userId, initialize]);

  return null;
}
