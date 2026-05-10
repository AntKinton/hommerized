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
          title="Connection error to Lidarr API, check url and apikey in config.yml"
          >?</strong
        >
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "Lidarr",
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
        .catch(handleError);
        
      fetch(`/api/v1/queue/status?apikey=${props.item.apikey}`)
        .then((queue) => {
          activity.value = queue.totalCount;
        })
        .catch(handleError);
        
      fetch(`/api/v1/wanted/missing?apikey=${props.item.apikey}`)
        .then((queue) => {
          missing.value = queue.totalRecords;
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
  .notif {
    display: inline-block;
    padding-right: 0.35em;
    padding-left: 0.35em;
    padding-top: 0.2em;
    padding-bottom: 0.2em;
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
