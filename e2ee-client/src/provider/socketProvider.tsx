"use client";
import React from "react"
import { useSocketConnection } from "@/hooks/useSocketConnection";

export const SocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  useSocketConnection();
  return <>{ children } </>;
};
