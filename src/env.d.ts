interface BasedOn {
  name: string;
  version: string;
}

declare const __APP_VERSION__: string;
declare const __BASED_ON__: BasedOn;

interface Window {
  __AUTH_HEADERS__?: {
    user?: string;
    email?: string;
    name?: string;
    groups?: string | string[];
  };
  __INITIAL_CONFIG__?: any;
}

// Global types for services and policies
interface ServiceItem {
  name: string;
  url: string;
  icon?: string;
  logo?: string;
  desc?: string;
  tag?: string;
  apikey?: string;
  endpoint?: string;
  useCredentials?: boolean | string;
  headers?: Record<string, string>;
  successCodes?: number[];
  updateIntervalMs?: number | false;
}

interface ServiceGroup {
  name: string;
  items: ServiceItem[];
}

interface LinkItem {
  name: string;
  url: string;
  icon?: string;
  target?: string;
}

interface PolicyConfig {
  groups?: Record<string, any>;
  servicePolicies?: Record<string, {
    services: string[];
    allowedGroups: string[];
  }>;
  groupTitleMapping?: Record<string, string>;
}
