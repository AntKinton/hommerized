<template>
  <div>
    <template v-if="filteredServices && filteredServices.length > 0">
      <div v-for="(group, groupIndex) in filteredServices" :key="`group-${groupIndex}`" class="mb-6">
        
        <div class="mb-4">
          <GroupDescription 
            v-if="group && group.name" 
            :group="group" 
          />
        </div>

        <div v-if="currentLayout === 'list'" class="is-layout-list layout-vertical-services">
          <div
            v-for="(item, index) in (group && group.items ? group.items : [])"
            :key="`srv-${groupIndex}-${index}-${item.name || item.type}`"
            class="mb-4"
          >
            <ServiceHandler
              :item="item"
              :proxy="proxy"
              :class="[item.class || (group && group.class)]" 
            />
          </div>
        </div>

        <div v-else-if="currentLayout === 'grid'" class="fixed-grid grid has-5-cols-desktop has-4-cols-tablet has-2-cols-mobile">
          <div
            v-for="(item, index) in (group && group.items ? group.items : [])"
            :key="`srv-${groupIndex}-${index}-${item.name || item.type}`"
            class="cell"
          >
            <ServiceHandler
              :item="item"
              :proxy="proxy"
              :class="['h-100', item.class || (group && group.class)]"
            />
          </div>
        </div>

        <div v-else class="columns is-multiline is-variable is-5 is-layout-columns">
          <div
            v-for="(item, index) in (group && group.items ? group.items : [])"
            :key="`srv-${groupIndex}-${index}-${item.name || item.type}`"
            class="column is-one-third-desktop is-half-tablet is-full-mobile"
          >
            <ServiceHandler
              :item="item"
              :proxy="proxy"
              :class="['h-100', item.class || (group && group.class)]"
            />
          </div>
        </div>

      </div>
    </template>
    
    <!-- Mensaje cuando no hay servicios -->
    <div v-else class="column is-full has-text-centered">
      <div class="box">
        <p class="title is-4">No services available</p>
        <p class="subtitle">Check your configuration and policies.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useConfigStore } from '@/stores/module-config.js';
import { usePoliciesStore } from '@/stores/module-policy.js';
// import StatusLoading from './StatusLoading.vue';
import ServiceHandler from '../ServiceHandler.vue';
import GroupDescription from './GroupDescription.vue';

export default {
  name: 'GroupServices',
  components: {
    ServiceHandler,
    GroupDescription,
    // StatusLoading
  },
  props: {
    // Componente completamente autónomo - no necesita props externos
  },
  setup() {
    const configStore = useConfigStore();
    const policiesStore = usePoliciesStore();
    
    // Acceso directo a los stores usando getters existentes
    const currentConfig = computed(() => configStore.currentConfig);
    /** @type {import('vue').ComputedRef<ServiceGroup[]>} */
    const filteredServices = computed(() => /** @type {any} */ (policiesStore.getFilteredServices));
    
    // Obtener proxy y columns del configStore
    const proxy = computed(() => configStore.get('proxy'));
    const columns = computed(() => configStore.get('defaults.columns', 3));
    
    // Direct string evaluation. No boolean conversion needed.
    const currentLayout = computed(() => {
      return currentConfig.value?.defaults?.layout || 'columns'; 
    });
    
    return {
      currentConfig,
      filteredServices: /** @type {any} */ (filteredServices),
      currentLayout,
      proxy,
      columns
    };
  }
}
</script>
