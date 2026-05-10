<template>
  <div class="service-example">
    <h3>{{ item.name || 'Example Service' }}</h3>
    <p>Status: <span :class="statusClass">{{ statusText }}</span></p>
    <button @click="fetchData" :disabled="isLoading">
      {{ isLoading ? 'Loading...' : 'Refresh Data' }}
    </button>
    <div v-if="error" class="error-message">
      <strong>Error:</strong> {{ error.message }}
    </div>
    <div v-if="data" class="data-display">
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
import { useService } from '@/composables/useService.js';

export default {
  name: 'ExampleService',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const {
      endpoint,
      isLoading,
      error,
      fetch,
      initAutoUpdate,
      cleanupAutoUpdate
    } = useService(props.item);

    const statusClass = computed(() => {
      if (isLoading.value) return 'status-loading';
      if (error.value) return 'status-error';
      return 'status-online';
    });

    const statusText = computed(() => {
      if (isLoading.value) return 'Loading...';
      if (error.value) return 'Error';
      return 'Online';
    });

    const data = ref(null);

    const fetchData = async () => {
      try {
        data.value = await fetch();
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    // Initialize auto-update if configured
    initAutoUpdate(async () => {
      await fetchData();
    });

    return {
      endpoint,
      isLoading,
      error,
      statusClass,
      statusText,
      data,
      fetchData,
      initAutoUpdate,
      cleanupAutoUpdate
    };
  }
};
</script>

<style scoped>
.service-example {
  padding: 1rem;
  border: 1px solid var(--component-border);
  border-radius: 0.5rem;
  background-color: var(--card-background);
}

.status-loading {
  color: var(--status-loading);
}

.status-error {
  color: var(--status-error);
}

.status-online {
  color: var(--status-online);
}

.error-message {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: var(--component-error-bg);
  border: 1px solid var(--status-error);
  border-radius: 0.25rem;
  color: var(--text);
}

.data-display {
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: var(--component-hover-bg);
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.8rem;
}

button {
  padding: 0.5rem 1rem;
  background-color: var(--highlight-primary);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: var(--highlight-hover);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
