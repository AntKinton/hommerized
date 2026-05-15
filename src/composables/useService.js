import { ref, computed, onBeforeUnmount } from 'vue';
import { useConfigStore } from '../stores/module-config.js';

/**
 * Service composable to replace service.js mixin
 * Provides reactive service functionality with better IDE support
 * @param {any} item
 * @param {any} proxy
 */
export function useService(item, proxy = null) {
  /** @type {ServiceItem} */
  const srvItem = item;
  /** @type {any} */
  const srvProxy = proxy;

  // Initialize Pinia store
  const configStore = useConfigStore();
  
  // Reactive state
  const endpoint = ref(srvItem.endpoint || srvItem.url);
  const isLoading = ref(false);
  const error = ref(null);
  
  // Initialize endpoint in created lifecycle
  if (endpoint.value && endpoint.value.endsWith('/')) {
    endpoint.value = endpoint.value.slice(0, -1);
  }

  // Computed properties
  const globalConfig = computed(() => configStore.currentConfig || {});
  
  const updateInterval = computed(() => {
    // Use service-specific interval if defined
    if (srvItem.updateIntervalMs !== undefined) {
      const interval = srvItem.updateIntervalMs;
      if (interval === false || interval === 0) return 0;
      return (typeof interval === 'string' ? parseInt(interval, 10) : interval) || 0;
    }

    // Use global auto-update configuration
    const globalAutoUpdate = globalConfig.value.updateIntervalMs;
    if (!globalAutoUpdate) {
      return 0;
    }
    return parseInt(globalAutoUpdate, 10) || 0;
  });

  // Fetch function with proper proxy/credential precedence
  const fetch = async (path, init = {}, json = true) => {
    /** @type {RequestInit} */
    const options = { ...init };

    // Priority: Item > Proxy > Default
    // Credentials
    if (srvItem.useCredentials !== undefined) {
      options.credentials = srvItem.useCredentials === true ? 'include' : 'omit';
    } else if (srvProxy?.useCredentials) {
      options.credentials = 'include';
    }

    // Headers
    if (srvItem.headers !== undefined && !!srvItem.headers) {
      options.headers = srvItem.headers;
    } else if (srvProxy?.headers && !!srvProxy.headers) {
      options.headers = srvProxy.headers;
    }

    // URL construction
    let url = endpoint.value;
    if (path) {
      const cleanPath = path.startsWith('/') ? path.slice(1) : path;
      url = `${endpoint.value}/${cleanPath}`;
    }

    // Request execution
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await globalThis.fetch(url, options);
      
      let success = response.ok;
      if (Array.isArray(srvItem.successCodes)) {
        success = srvItem.successCodes.includes(response.status);
      }

      if (!success) {
        throw new Error(
          `Failed to fetch resource: (${response.status} error)`,
          { cause: response }
        );
      }

      const result = json ? await response.json() : await response.text();
      isLoading.value = false;
      return result;
      
    } catch (err) {
      isLoading.value = false;
      error.value = err;
      throw err;
    }
  };

  // Auto-update initialization
  const initAutoUpdate = (updateMethod) => {
    if (typeof updateMethod !== 'function') return;

    const interval = updateInterval.value;
    if (interval > 0) {
      import('@/utils/updateScheduler.js').then(scheduler => {
        scheduler.default.register({ item: srvItem, interval, updateMethod });
      });
    }
  };

  // Automatic cleanup when component unmounts
  onBeforeUnmount(() => {
    import('@/utils/updateScheduler.js').then(scheduler => {
      scheduler.default.unregister({ item: srvItem });
    });
  });

  
  return {
    // State
    endpoint,
    isLoading,
    error,
    
    // Computed
    globalConfig,
    updateInterval,
    
    // Methods
    fetch,
    initAutoUpdate
    // cleanupAutoUpdate is now handled automatically by onBeforeUnmount
  };
}
