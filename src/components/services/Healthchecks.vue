<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="up > 0" class="notif up" title="Up">
          {{ up }}
        </strong>
        <strong v-if="down > 0" class="notif down" title="Down">
          {{ down }}
        </strong>
        <strong v-if="grace > 0" class="notif grace" title="Grace">
          {{ grace }}
        </strong>
      </div>
    </template>
  </Generic>
</template>

<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

export default {
  name: "Healthchecks",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const api = ref(null);

    const up = computed(() => {
      if (!api.value) {
        return "";
      }
      return api.value.checks?.filter((check) => {
        return check.status.toLowerCase() === "up";
      }).length;
    });

    const down = computed(() => {
      if (!api.value) {
        return "";
      }
      return api.value.checks?.filter((check) => {
        return check.status.toLowerCase() === "down";
      }).length;
    });

    const grace = computed(() => {
      if (!api.value) {
        return "";
      }
      return api.value.checks?.filter((check) => {
        return check.status.toLowerCase() === "grace";
      }).length;
    });

    const fetchStatus = async () => {
      const apikey = props.item.apikey;
      if (!apikey) {
        console.error(
          "apikey is not present in config.yml for Healthchecks entry!",
        );
        return;
      }

      const headers = {
        "X-Api-Key": props.item.apikey,
      };

      try {
        api.value = await fetch("/api/v1/checks/", { headers });
      } catch (e) {
        console.error(e);
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchStatus);

    // Initial data fetch
    fetchStatus();

    return {
      api,
      up,
      down,
      grace,
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

    &.up {
      background-color: #4fd671;
    }

    &.down {
      background-color: #e51111;
    }

    &.grace {
      background-color: #cdd02e;
    }
  }
}
</style>
