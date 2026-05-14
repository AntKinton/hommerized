<template>
  <component 
    :is="archetypeComponent" 
    :item="item" 
    :adapter="serviceAdapter"
    :proxy="proxy"
    v-bind="$attrs"
  />
</template>

<script>
import { defineAsyncComponent, shallowRef, watchEffect } from 'vue';

// Pre-load archetypes (there are only 6 now, so no need to lazy load them aggressively)
import MetricCard from './archetypes/MetricCard.vue';
import StatusCard from './archetypes/StatusCard.vue';
import MediaCard from './archetypes/MediaCard.vue';
import NotificationCard from './archetypes/NotificationCard.vue';
import ActionCard from './archetypes/ActionCard.vue';
import WeatherCard from './archetypes/WeatherCard.vue';

const archetypes = {
  MetricCard,
  StatusCard,
  MediaCard,
  NotificationCard,
  ActionCard,
  WeatherCard,
  Generic: defineAsyncComponent(() => import('./service-components/Generic.vue'))
};

export default {
  name: 'Service',
  props: { 
    item: Object,
    proxy: String
  },
  setup(props) {
    const archetypeComponent = shallowRef(archetypes.Generic);
    const serviceAdapter = shallowRef(null);

    watchEffect(async () => {
      const serviceType = props.item.type;
      if (!serviceType || serviceType === 'Generic') {
        archetypeComponent.value = archetypes.Generic;
        return;
      }

      try {
        // Dynamically import only the pure JS logic
        const module = await import(`../adapters/${serviceType}.js`);
        serviceAdapter.value = module.default;

        // Select the UI layout based on the adapter's configuration
        archetypeComponent.value = archetypes[module.default.archetype] || archetypes.Generic;
      } catch {
        console.warn(`Adapter for ${serviceType} not found, falling back to Generic.`);
        archetypeComponent.value = archetypes.Generic;
      }
    });

    return { 
      archetypeComponent, 
      serviceAdapter 
    };
  }
};
</script>
