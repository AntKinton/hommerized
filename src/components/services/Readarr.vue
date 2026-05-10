<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="activity > 0" class="notif activity" title="Activity">
          {{ activity }}
        </strong>
        <strong v-if="missing > 0" class="notif missing" title="Missing">
          {{ missing }}
        </strong>
        <strong v-if="warnings > 0" class="notif warnings" title="Warning">
          {{ warnings }}
        </strong>
        <strong v-if="errors > 0" class="notif errors" title="Error">
          {{ errors }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Readarr API, check url and apikey in config.yml"
          >?</strong
        >
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref } from 'vue';
import { useService } from '@/composables/useService.js';

const API = "/api/v1";

export default {
  name: "Readarr",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const activity = ref(null);
    const missing = ref(null);
    const warnings = ref(null);
    const errors = ref(null);
    const serverError = ref(false);

    const fetchConfig = () => {
      const handleError = (e) => {
        console.error(e);
        serverError.value = true;
      };
      
      fetch(`${API}/health?apikey=${props.item.apikey}`)
        .then((health) => {
          warnings.value = health.filter((h) => h.type === "warning").length;
          errors.value = health.filter((h) => h.type === "errors").length;
        })
        .catch(handleError);
        
      fetch(`${API}/queue?apikey=${props.item.apikey}`)
        .then((queue) => {
          activity.value = queue.totalRecords;
        })
        .catch(handleError);
        
      fetch(`${API}/wanted/missing?apikey=${props.item.apikey}`)
        .then((missing) => {
          missing.value = missing.totalRecords;
        })
        .catch(handleError);
    };

    // Initialize auto-update
    initAutoUpdate(fetchConfig);

    // Initial data fetch
    fetchConfig();

    return {
      activity,
      missing,
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
  display: flex;
  gap: 0.2rem;
  .notif {
    padding: 0.2em 0.35em;
    border-radius: 0.25em;
    font-size: 0.8em;
    &.activity {
      background-color: #4fb5d6;
    }

    &.missing {
      background-color: #9d00ff;
    }

    &.warnings {
      background-color: #d08d2e;
    }

    &.errors {
      background-color: #e51111;
    }
  }
}
</style>
