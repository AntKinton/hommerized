<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="wanted > 0" class="notif wanted" title="Wanted">
          {{ wanted }}
        </strong>
        <strong v-if="upcoming > 0" class="notif upcoming" title="Upcoming">
          {{ upcoming }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Mylar API, check url and apikey in config.yml"
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
  name: "Mylar",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const upcoming = ref(null);
    const wanted = ref(null);
    const warnings = ref(null);
    const errors = ref(null);
    const serverError = ref(false);

    const fetchConfig = () => {
      const handleError = (e) => {
        console.error(e);
        serverError.value = true;
      };
      
      fetch(`/api?cmd=getUpcoming&apikey=${props.item.apikey}`)
        .then((upcoming) => {
          upcoming.value = upcoming.length;
        })
        .catch(handleError);
        
      fetch(`/api?cmd=getWanted&apikey=${props.item.apikey}`)
        .then((wanted) => {
          wanted.value = wanted.issues.length + wanted.annuals.length;
        })
        .catch(handleError);
    };

    // Initialize auto-update
    initAutoUpdate(fetchConfig);

    // Initial data fetch
    fetchConfig();

    return {
      upcoming,
      wanted,
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

    &.wanted {
      background-color: #4fb5d6;
    }

    &.upcoming {
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
