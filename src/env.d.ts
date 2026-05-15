/// <reference types="vite/client" />

interface BasedOn {
  name: string;
  version: string;
}

declare const __APP_VERSION__: string;
declare const __BASED_ON__: BasedOn;
