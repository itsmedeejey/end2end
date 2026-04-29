"use client"

import { SignalProtocolStore } from "./signalStore";

let signalStore: SignalProtocolStore | null = null;


export function getSignalStore() {
  if (typeof window === "undefined") {

    throw new Error("signal store cannot be accesded in the server side")
  }
  if (!signalStore) {
    return signalStore = new SignalProtocolStore();
  }
  return signalStore;

}
