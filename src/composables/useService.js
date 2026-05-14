import { ref, computed, onBeforeUnmount } from 'vue';
import { useConfigStore } from '../stores/module-config.js';

/**
 * Service composable to replace service.js mixin
 * Provides reactive service functionality with better IDE support
 */
export function useService(item, proxy = null) {
  // Initialize Pinia store
  const configStore = useConfigStore();
  
  // Reactive state
  const endpoint = ref(item.endpoint || item.url);
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
    if (item.updateIntervalMs !== undefined) {
      const interval = item.updateIntervalMs;
      return interval === false || interval === 0 ? 0 : parseInt(interval, 10) || 0;
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
    const options = { ...init };

    // Priority: Item > Proxy > Default
    // Credentials
    if (item.useCredentials !== undefined) {
      options.credentials = item.useCredentials === true ? 'include' : 'omit';
    } else if (proxy?.useCredentials) {
      options.credentials = 'include';
    }

    // Headers
    if (item.headers !== undefined && !!item.headers) {
      options.headers = item.headers;
    } else if (proxy?.headers && !!proxy.headers) {
      options.headers = proxy.headers;
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
      const response = await fetch(url, options);
      
      let success = response.ok;
      if (Array.isArray(item.successCodes)) {
        success = item.successCodes.includes(response.status);
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
        scheduler.default.register({ item, interval, updateMethod });
      });
    }
  };

  // Automatic cleanup when component unmounts
  onBeforeUnmount(() => {
    import('@/utils/updateScheduler.js').then(scheduler => {
      scheduler.default.unregister({ item });
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
