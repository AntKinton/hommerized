<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong class="notif total" title="Total Devices">
          {{ total }}
        </strong>
        <strong class="notif connected" title="Connected Devices">
          {{ connected }}
        </strong>
        <strong class="notif newdevices" title="New Devices">
          {{ newdevices }}
        </strong>
        <strong class="notif alert" title="Down Alerts">
          {{ downalert }}
        </strong>
        <strong
          v-if="serverError"
          class="notif alert"
          title="Connection error to PiAlert server, check the url in config.yml"
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
  name: "PiAlert",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const total = ref(0);
    const connected = ref(0);
    const newdevices = ref(0);
    const downalert = ref(0);
    const serverError = ref(false);

    const fetchStatus = async () => {
      try {
        const response = await fetch("/php/server/devices.php?action=getDevicesTotals");
        total.value = response[0];
        connected.value = response[1];
        newdevices.value = response[3];
        downalert.value = response[4];
        serverError.value = false;
      } catch (e) {
        console.log(e);
        serverError.value = true;
      }
    };

    // Initialize auto-update
    initAutoUpdate(fetchStatus);

    // Initial data fetch
    fetchStatus();

    return {
      total,
      connected,
      newdevices,
      downalert,
      serverError,
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

    &.total {
      background-color: #4fb5d6;
    }

    &.connected {
      background-color: #4fd671;
    }

    &.newdevices {
      background-color: #d08d2e;
    }

    &.alert {
      background-color: #e51111;
    }
  }
}
</style>
