<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="queue > 0"
          class="notif queue"
          :title="`${queue} items queued`"
        >
          {{ queue }}
        </strong>
        <strong
          v-if="errored > 0"
          class="notif errored"
          :title="`${errored} items`"
        >
          {{ errored }}
        </strong>
        <i
          v-if="error"
          class="notif error fa-solid fa-triangle-exclamation"
          title="Unable to fetch current status"
        ></i>
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "Tdarr",
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

    const queue = computed(() => {
      if (!stats.value) {
        return "";
      }
      return stats.value.table1Count;
    });

    const errored = computed(() => {
      if (!stats.value) {
        return "";
      }
      return stats.value.table6Count;
    });

    const fetchStatus = async () => {
      try {
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            headers: { "content-Type": "application/json" },
            data: {
              collection: "StatisticsJSONDB",
              mode: "getById",
              docID: "statistics",
              obj: {},
            },
            timeout: 1000,
          }),
        };
        const response = await fetch("/api/v2/cruddb", options);
        error.value = false;
        stats.value = response;
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
      queue,
      errored,
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

    &.queue {
      background-color: #28a9a3;
    }

    &.errored {
      background-color: #e51111;
    }

    &.error {
      border-radius: 50%;
      aspect-ratio: 1;
      background-color: #e51111;
    }
  }
}
</style>
