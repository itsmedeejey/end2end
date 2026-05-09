"use client";

import { useInitSodium } from "@/hooks/useInitSodium";

export default function SodiumProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  useInitSodium();

  return <>{children}</>;
}
