<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="running > 0" class="notif warnings" title="Running">
          {{ running }}
        </strong>
        <strong v-if="update > 0" class="notif errors" title="Update">
          {{ update }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to WUD API, check url in config.yml"
        >
          ?
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "WUD",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const running = ref(null);
    const update = ref(null);
    const serverError = ref(false);

    const fetchConfig = () => {
      fetch("/api/containers")
        .then((containers) => {
          running.value = 0;
          update.value = 0;
          for (var i = 0; i < containers.length; i++) {
            running.value++;
            if (containers[i].updateAvailable) {
              update.value++;
            }
          }
        })
        .catch(() => {
          serverError.value = true;
        });
    };

    // Initialize auto-update
    initAutoUpdate(fetchConfig);

    // Initial data fetch
    fetchConfig();

    return {
      running,
      update,
      serverError,
      fetchConfig
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

    &.warnings {
      background-color: #d08d2e;
    }

    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
