<template>
  <Generic :item="item">
    <template #indicator>
      <div class="notifs">
        <strong v-if="passed > 0" class="notif passed" title="Passed">
          {{ passed }}
        </strong>
        <strong v-if="failed > 0" class="notif failed" title="Failed">
          {{ failed }}
        </strong>
        <strong v-if="unknown > 0" class="notif unknown" title="Unknown">
          {{ unknown }}
        </strong>
        <strong
          v-if="serverError"
          class="notif errors"
          title="Connection error to Scrutiny API, check your url in config.yml"
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
  name: "Scrutiny",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch,
      initAutoUpdate
    } = useService(props.item);

    const passed = ref(null);
    const failed = ref(null);
    const unknown = ref(null);
    const serverError = ref(false);

    const fetchSummary = () => {
      fetch(`/api/summary`)
        .then((scrutinyData) => {
          const devices = Object.values(scrutinyData.data.summary);       
          const availableDevices = devices.filter(
            (device) =>
              device.device.archived === false &&
              !device.device.DeletedAt
          );
          passed.value =
            availableDevices.filter(
              (device) => 
                device.device.device_status === 0)?.length || 0;
          failed.value =
            availableDevices.filter(
              (device) =>
                device.device.device_status > 0 &&
                device.device.device_status <= 3)?.length || 0;
          unknown.value = availableDevices.length - (passed.value + failed.value) || 0;
        })
        .catch((e) => {
          console.error(e);
          serverError.value = true;
        });
    };

    // Initialize auto-update
    initAutoUpdate(fetchSummary);

    // Initial data fetch
    fetchSummary();

    return {
      passed,
      failed,
      unknown,
      serverError,
      fetchSummary
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
    &.passed {
      background-color: green;
    }

    &.failed {
      background-color: #e51111;
    }

    &.unknown {
      background-color: #d08d2e;
    }
  }
}
</style>
