import { Capacitor } from "@capacitor/core";
import { CapacitorStorageAdapter } from "./capacitor-storage";
import type { StorageAdapter } from "./storage-adapter";
import { WebStorageAdapter } from "./web-storage";

export const storage: StorageAdapter = Capacitor.isNativePlatform() ? new CapacitorStorageAdapter() : new WebStorageAdapter();
