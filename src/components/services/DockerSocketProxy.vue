<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong
          v-if="running > 0"
          class="notif running"
          title="Running Containers"
        >
          {{ running }}
        </strong>
        <strong
          v-if="stopped > 0"
          class="notif stopped"
          title="Stopped Containers"
        >
          {{ stopped }}
        </strong>
        <strong v-if="errors > 0" class="notif errors" title="Error">
          {{ errors }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Docker Socket Proxy API"
        >
          Unavailable
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "DockerSocketProxy",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const running = ref(null);
    const stopped = ref(null);
    const errors = ref(null);
    const serverError = ref(false);

    const fetchData = async () => {
      const handleError = (e) => {
        console.error(e);
        serverError.value = true;
      };

      try {
        // Fetch all containers (including stopped) from Docker Socket Proxy
        const containers = await fetch("/containers/json?all=true"); // Docker endpoint for container statuses
        running.value = containers.filter(
          (container) => container.State === "running",
        ).length;
        stopped.value = containers.filter(
          (container) => container.State === "exited",
        ).length;
      } catch (e) {
        handleError(e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchData);

    // Initial data fetch
    fetchData();

    return {
      running,
      stopped,
      errors,
      serverError,
      fetchData
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

    &.running {
      background-color: #4fb5d6;
    }

    &.stopped {
      background-color: #d08d2e;
    }

    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
