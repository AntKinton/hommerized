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
          title="Connection error to Sonarr API, check url and apikey in config.yml"
        >
          ?
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

const V3_API = "/api/v3";
const LEGACY_API = "/api";

export default {
  name: "Sonarr",
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

    const apiPath = computed(() => {
      return props.item.legacyApi ? LEGACY_API : V3_API;
    });

    const fetchConfig = () => {
      const handleError = (e) => {
        console.error(e);
        serverError.value = true;
      };
      
      fetch(`${apiPath.value}/health?apikey=${props.item.apikey}`)
        .then((health) => {
          warnings.value = health.filter((h) => h.type === "warning").length;
          errors.value = health.filter((h) => h.type === "errors").length;
        })
        .catch(handleError);
        
      fetch(`${apiPath.value}/queue?apikey=${props.item.apikey}`)
        .then((queue) => {
          activity.value = 0;

          if (props.item.legacyApi) {
            for (var i = 0; i < queue.length; i++) {
              if (queue[i].series) {
                activity.value++;
              }
            }
          } else {
            activity.value = queue.totalRecords;
          }
        })
        .catch(handleError);
        
      fetch(`${apiPath.value}/wanted/missing?apikey=${props.item.apikey}`)
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
      apiPath,
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
