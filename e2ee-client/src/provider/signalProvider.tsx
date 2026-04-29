"use client";

import { useInitSignal } from "@/hooks/useInitSignal";

export function SignalProvider({ children }: { children: React.ReactNode }) {
  useInitSignal();
  return <>{children} </>;
}
