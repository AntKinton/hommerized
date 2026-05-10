<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p v-if="item.subtitle" class="subtitle is-6">{{ item.subtitle }}</p>
      <p v-else class="subtitle is-6">
        <span v-if="error" class="error">An error has occurred.</span>
        <template v-else>
          <span class="down monospace">
            <p class="fas fa-download"></p>
            {{ downRate }}
          </span>
          <span class="up monospace">
            <p class="fas fa-upload"></p>
            {{ upRate }}
          </span>
        </template>
      </p>
    </template>
    <template #indicator>
      <span v-if="!error" class="count"
        >{{ count || 0 }}
        <template v-if="(count || 0) === 1">torrent</template>
        <template v-else>torrents</template>
      </span>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';
import { formatSpeed } from '@/utils/formatters.js';

export default {
  name: "Transmission",
  props: { item: Object },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    // Properties for download, upload, torrent count and errors.
    const dl = ref(null);
    const ul = ref(null);
    const count = ref(null);
    const error = ref(null);
    const sessionId = ref(null);
    const retry = ref(0);

    // Computed properties for rate labels.
    const downRate = computed(() => {
      return formatSpeed(dl.value);
    });

    const upRate = computed(() => {
      return formatSpeed(ul.value);
    });

    /**
     * Makes a request to Transmission RPC API with proper session handling
     * @param {string} method - The RPC method to call
     * @returns {Promise<Object>} RPC response
     */
    const transmissionRequest = async (method) => {
      const options = getRequestHeaders(method);

      // Add session ID header if we have one
      if (sessionId.value) {
        options.headers["X-Transmission-Session-Id"] = sessionId.value;
      }

      try {
        return await fetch("transmission/rpc", options);
      } catch (error) {
        // Handle Transmission's 409 session requirement
        if (error.cause.status == 409 && retry.value <= 1) {
          const newSessionId = await getSession();
          if (newSessionId) {
            sessionId.value = newSessionId;
            retry.value = 0; // Reset counter on successful session renewal
            return transmissionRequest(method);
          }
        }
        console.error("Transmission RPC error:", error);
        throw error;
      }
    };

    const getRequestHeaders = (method) => {
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ method }),
      };

      if (props.item.auth) {
        options.headers["Authorization"] = `Basic ${btoa(props.item.auth)}`;
      }

      return options;
    };

    const getSession = async () => {
      try {
        await fetch(
          "transmission/rpc",
          getRequestHeaders("session-get"),
        );
      } catch (error) {
        if (error.cause.status == 409) {
          return error.cause.headers.get("X-Transmission-Session-Id");
        }
      }
    };

    // Combined method for scheduler - fetches both rates and count
    const getStats = async () => {
      try {
        // Get session stats for transfer rates and torrent count
        const statsResponse = await transmissionRequest("session-stats");
        if (statsResponse?.result !== "success") {
          throw new Error(
            `Transmission RPC failed: ${statsResponse?.result || "Unknown error"}`,
          );
        }

        const stats = statsResponse.arguments;
        dl.value = stats.downloadSpeed ?? 0;
        ul.value = stats.uploadSpeed ?? 0;
        count.value = stats.activeTorrentCount ?? 0;
        error.value = false;
      } catch (e) {
        error.value = true;
        console.error("Transmission service error:", e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(getStats);

    // Initial fetch
    getStats();

    return {
      dl,
      ul,
      count,
      error,
      downRate,
      upRate,
      getStats
    };
  },
};
</script>

<style scoped lang="scss">
.error {
  color: #e51111 !important;
}

.down {
  margin-right: 1em;
}

.count {
  color: var(--text);
  font-size: 0.8em;
}

.monospace {
  font-weight: 300;
  font-family: monospace;
}
</style>
