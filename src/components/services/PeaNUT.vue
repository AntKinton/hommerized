<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="load"> {{ load }}&percnt; UPS Load </template>
      </p>
    </template>
    <template #indicator>
      <div v-if="ups_status" class="status" :class="status_class">
        {{ status_text }}
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "PeaNUT",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const ups_status = ref("");
    const ups_load = ref(0);

    const status_text = computed(() => {
      switch (ups_status.value) {
        case "OL":
          return "online";
        case "OB":
          return "on battery";
        case "LB":
          return "low battery";
        default:
          return "unknown";
      }
    });

    const status_class = computed(() => {
      switch (ups_status.value) {
        case "OL":
          return "online";
        case "OB": // On battery
          return "pending";
        case "LB": // Low battery
          return "offline";
        default:
          return "unknown";
      }
    });

    const load = computed(() => {
      if (ups_load.value) {
        return ups_load.value.toFixed(1);
      }
      return "";
    });

    const fetchStatus = async () => {
      const device = props.item.device || "";

      try {
        const result = await fetch(`/api/v1/devices/${device}`);
        ups_status.value = result["ups.status"] || "";
        ups_load.value = result["ups.load"] || 0;
      } catch (e) {
        console.log(e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchStatus);

    // Initial data fetch
    fetchStatus();

    return {
      ups_status,
      ups_load,
      status_text,
      status_class,
      load,
      fetchStatus
    };
  },
};
</script>
