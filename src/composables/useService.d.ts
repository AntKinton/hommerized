/**
 * Type definitions for useService composable
 * Provides better IDE autocompletion and type safety
 */

import type { Ref, ComputedRef } from 'vue';

export interface ServiceItem {
  name?: string;
  endpoint?: string;
  url?: string;
  useCredentials?: boolean;
  headers?: Record<string, string>;
  updateIntervalMs?: number | false;
  successCodes?: number[];
  [key: string]: any;
}

export interface ProxyConfig {
  useCredentials?: boolean;
  headers?: Record<string, string>;
  [key: string]: any;
}

export interface ServiceState {
  endpoint: Ref<string | undefined>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  globalConfig: ComputedRef<any>;
  updateInterval: ComputedRef<number>;
}

export interface ServiceMethods {
  fetch: (path?: string, init?: RequestInit, json?: boolean) => Promise<any>;
  initAutoUpdate: (updateMethod: () => void) => void | Promise<void>;
  cleanupAutoUpdate: () => Promise<void>;
}

export declare function useService(item: ServiceItem, proxy?: ProxyConfig): ServiceState & ServiceMethods;
