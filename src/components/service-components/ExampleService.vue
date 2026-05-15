<template>
  <div class="card">
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <p class="title is-5">{{ item.name || 'Example Service' }}</p>
          
          <div class="tags mb-4">
            <span class="tag" :class="bulmaStatusClass">
              <span v-if="isLoading" class="icon is-small mr-1">
                <i class="fas fa-circle-notch fa-spin"></i>
              </span>
              {{ statusText }}
            </span>
          </div>

          <button
class="button is-primary is-small" 
                  :class="{ 'is-loading': isLoading }" 
                  :disabled="isLoading" 
                  @click="fetchData">
            Refresh Data
          </button>
        </div>
      </div>

      <div v-if="error" class="notification is-danger is-light mt-4 p-3">
        <button class="delete" @click="error = null"></button>
        <strong>Error:</strong> {{ error.message }}
      </div>

      <div v-if="data" class="box mt-4 p-3" style="overflow-x: auto; background-color: var(--card-background);">
        <pre class="has-background-transparent p-0 is-size-7">{{ JSON.stringify(data, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
// Añadidos los imports de Vue que faltaban en el original
import { ref, computed } from 'vue';
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

    // Mapeo directo a los colores semánticos de Bulma
    const bulmaStatusClass = computed(() => {
      if (isLoading.value) return 'is-warning';
      if (error.value) return 'is-danger';
      return 'is-success';
    });

    const statusText = computed(() => {
      if (isLoading.value) return 'Loading...';
      if (error.value) return 'Offline';
      return 'Online';
    });

    const data = ref(null);

    const fetchData = async () => {
      try {
        error.value = null; // Limpiar errores previos
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
      bulmaStatusClass,
      statusText,
      data,
      fetchData,
      initAutoUpdate,
      cleanupAutoUpdate
    };
  }
};
</script>

