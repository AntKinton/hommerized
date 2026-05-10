<template>
  <Generic :item="item">
    <template #indicator>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else>
          {{ rttLabel }}
        </template>
      </p>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "Ping",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const status = ref(null);
    const rtt = ref(null);

    const rttLabel = computed(() => {
      if (status.value === "online") {
        return `${rtt.value}ms`;
      }
      return "unavailable";
    });

    const fetchStatus = async () => {
      const method =
        typeof props.item.method === "string"
          ? props.item.method.toUpperCase()
          : "HEAD";

      if (!["GET", "HEAD", "OPTION"].includes(method)) {
        console.error(`Ping: ${method} is not a supported HTTP method`);
        return;
      }

      const startTime = performance.now();
      const timeout = parseInt(props.item.timeout, 10) || 2000;
      const params = {
        method,
        cache: "no-cache",
        signal: AbortSignal.timeout(timeout),
      };

      try {
        await fetch("/", params, false);
        status.value = "online";
        const endTime = performance.now();
        rtt.value = Math.round(endTime - startTime);
      } catch {
        status.value = "offline";
        rtt.value = null; // Reset rtt on failure
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchStatus);

    // Initial data fetch
    fetchStatus();

    return {
      status,
      rtt,
      rttLabel,
      fetchStatus
    };
  },
};
</script>

<style scoped lang="scss">
.status {
  font-size: 0.8rem;
  color: var(--text-title);
  white-space: nowrap;
  margin-left: 0.25rem;

  &.online:before {
    background-color: #94e185;
    border-color: #78d965;
    box-shadow: 0 0 5px 1px #94e185;
  }

  &.offline:before {
    background-color: #c9404d;
    border-color: #c42c3b;
    box-shadow: 0 0 5px 1px #c9404d;
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
