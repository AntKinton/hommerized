<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="warnings > 0" class="notif warnings" title="Warning">
          {{ warnings }}
        </strong>
        <strong v-if="errors > 0" class="notif errors" title="Error">
          {{ errors }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Prowlarr API, check url and apikey in config.yml"
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
  name: "Prowlarr",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const warnings = ref(null);
    const errors = ref(null);
    const serverError = ref(false);

    const fetchConfig = () => {
      fetch(`/api/v1/health?apikey=${props.item.apikey}`)
        .then((health) => {
          warnings.value = 0;
          errors.value = 0;
          for (var i = 0; i < health.length; i++) {
            if (health[i].type == "warning") {
              warnings.value++;
            } else if (health[i].type == "error") {
              errors.value++;
            }
          }
        })
        .catch((e) => {
          console.error(e);
          serverError.value = true;
        });
    };

    // Initialize auto-update
    initAutoUpdate(fetchConfig);

    // Initial data fetch
    fetchConfig();

    return {
      warnings,
      errors,
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
