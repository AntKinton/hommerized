<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="downloads > 0"
          class="notif downloading"
          :title="`${downloads} active download${downloads > 1 ? 's' : ''}`"
        >
          {{ downloads }}
        </strong>
        <i
          v-if="error"
          class="notif error fa-solid fa-triangle-exclamation"
          title="Unable to fetch current status"
        ></i>
      </div>
    </template>
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p v-if="item.subtitle" class="subtitle">
        {{ item.subtitle }}
      </p>
      <template v-else>
        <p class="subtitle is-6">
          <span v-if="error" class="error">An error has occurred.</span>
          <template v-else>
            <span class="down monospace">
              <p class="fas fa-download"></p>
              {{ downRate }}
            </span>
          </template>
        </p>
      </template>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';
import { formatBytes, formatSpeed } from "@/utils/formatters.js";

export default {
  name: "SABnzbd",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const stats = ref(null);
    const error = ref(false);
    const dlSpeed = ref(null);
    const ulSpeed = ref(null);

    const downloads = computed(() => {
      if (!stats.value) {
        return "";
      }
      return stats.value.noofslots;
    });

    const downRate = computed(() => {
      return formatSpeed(dlSpeed.value);
    });

    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `/api?output=json&apikey=${props.item.apikey}&mode=queue`,
        );
        error.value = false;
        stats.value = response.queue;

        // Fetching download speed from "speed" (convert to KB/s if needed)
        dlSpeed.value = parseFloat(response.queue.speed) * 1024; // Convert MB to KB
      } catch (e) {
        error.value = true;
        console.error(e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchStatus);

    // Initial data fetch
    fetchStatus();

    return {
      stats,
      error,
      dlSpeed,
      ulSpeed,
      downloads,
      downRate,
      fetchStatus
    };
  },
};
</script>

<style scoped lang="scss">
.notifs {
  position: absolute;
  color: white;
  font-family: sans-serif;
  top: 0.3em;
  right: 0.5em;

  .notif {
    display: inline-block;
    padding: 0.2em 0.35em;
    border-radius: 0.25em;
    position: relative;
    margin-left: 0.3em;
    font-size: 0.8em;

    &.downloading {
      background-color: #4fb5d6;
    }

    &.error {
      border-radius: 50%;
      aspect-ratio: 1;
      background-color: #e51111;
    }
  }
}

.error {
  color: #e51111 !important;
}

.down {
  margin-right: 1em;
}

.monospace {
  font-weight: 300;
  font-family: monospace;
}
</style>
