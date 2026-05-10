<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="stats">
          {{ percentage }}&percnt; blocked
        </template>
      </p>
    </template>
    <template #indicator>
      <div class="status" :class="protection">
        {{ protection }}
      </div>
    </template>
  </Generic>
</template>

<script>
import { computed, ref } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "AdGuardHome",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const status = ref(null);
    const stats = ref(null);

    const percentage = computed(() => {
      if (stats.value) {
        return (
          (stats.value.num_blocked_filtering * 100) /
          stats.value.num_dns_queries
        ).toFixed(2);
      }
      return "";
    });

    const protection = computed(() => {
      if (status.value) {
        return status.value.protection_enabled ? "enabled" : "disabled";
      } else return "unknown";
    });

    const fetchStatus = async () => {
      try {
        const statusData = await fetch("/control/status");
        status.value = statusData;
      } catch (e) {
        console.log(e);
      }

      if (!props.item.subtitle) {
        try {
          const statsData = await fetch("/control/stats");
          stats.value = statsData;
        } catch (e) {
          console.log(e);
        }
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchStatus);

    // Initial data fetch
    fetchStatus();

    return {
      status,
      stats,
      percentage,
      protection,
      fetchStatus
    };
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);

  &.enabled:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0px 0px 4px 1px #94e185;
  }

  &.disabled:before {
    background-color: #c9404d;
    border-color: #c42c3b;
    box-shadow: 0px 0px 4px 1px #c9404d;
  }

  &.unknown:before {
    background-color: #c9c740;
    border-color: #ccc935;
    box-shadow: 0px 0px 4px 1px #c9c740;
  }

  &:before {
    content: " ";
    display: inline-block;
    width: 7px;
    height: 7px;
    margin-right: 10px;
    border: 1px solid #000;
    border-radius: 7px;
  }
}
</style>
