<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="streams > 0"
          class="notif playing"
          :title="`${streams} active stream${streams > 1 ? 's' : ''}`"
        >
          {{ streams }}
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
  name: "Tautulli",
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

    const streams = computed(() => {
      if (!stats.value) {
        return "";
      }
      return stats.value.stream_count;
    });

    const fetchStatus = async () => {
      try {
        const response = await fetch(
          `/api/v2?apikey=${props.item.apikey}&cmd=get_activity`,
        );
        error.value = false;
        stats.value = response.response.data;
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
      streams,
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

    &.playing {
      background-color: #28a9a3;
    }

    &.error {
      border-radius: 50%;
      aspect-ratio: 1;
      background-color: #e51111;
    }
  }
}
</style>
