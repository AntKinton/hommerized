<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-for="(statItem, index) in item.stats" :key="statItem">
          <span v-if="stats[statItem]" :title="stats[statItem].label">
            <i :class="stats[statItem].icon"></i> {{ stats[statItem].value }}
            {{ stats[statItem].unit }}
            <span v-if="index != item.stats.length - 1"> / </span>
          </span>
        </template>
      </p>
    </template>
  </Generic>
</template>

<script>
import { ref } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "Glances",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const stats = ref([]);
    const error = ref(null);

    const fetchStat = async () => {
      try {
        const response = await fetch(`/api/4/quicklook`);
        stats.value["load"] = {
          value: response.load,
          label: "System load",
          icon: "fa-solid fa-bolt",
          unit: "%",
        };
        stats.value["cpu"] = {
          value: response.cpu,
          label: `CPU usage (${response.cpu_name})`,
          icon: "fa-solid fa-microchip",
          unit: "%",
        };
        stats.value["mem"] = {
          value: response.mem,
          label: `RAM usage`,
          icon: "fa-solid fa-memory",
          unit: "%",
        };
        stats.value["swap"] = {
          value: response.swap,
          label: `Swap usage`,
          icon: "fa-solid fa-file-arrow-down",
          unit: "%",
        };
      } catch (e) {
        console.log(e);
        error.value = "Unable to get metrics";
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchStat);

    // Initial data fetch
    fetchStat();

    return {
      stats,
      error,
      fetchStat
    };
  },
};
</script>
