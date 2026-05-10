<template>
  <Generic :item="item">
    <template #content>
      <p class="title is-4">{{ item.name }}</p>
      <p class="subtitle is-6">
        <template v-if="item.subtitle">
          {{ item.subtitle }}
        </template>
        <template v-else-if="currentInstance">
          Current instance: {{ currentInstance }}
        </template>
      </p>
    </template>
    <template #indicator>
      <div class="notifs">
        <strong v-if="running > 0" class="notif running" title="Running">
          {{ running }}
        </strong>
        <strong v-if="stopped > 0" class="notif stopped" title="Stopped">
          {{ stopped }}
        </strong>
      </div>
      <div v-if="status" class="status" :class="status">
        {{ status }}
      </div>
    </template>
  </Generic>
</template>
<script>
import { ref, computed } from 'vue';
import { useService } from '@/composables/useService.js';

const ENDPPOINT_SERVER_INFO = "/json-rpc?request=";

export default {
  name: "HyperHDR",
  props: {
    item: Object,
  },
  setup(props) {
    const {
      fetch
    } = useService(props.item);

    const serverInfo = ref(null);
    const error = ref(false);

    const instances = computed(() => {
      const instancesData = serverInfo.value?.info?.instance;
      return instancesData ?? [];
    });

    const currentInstance = computed(() => {
      const instanceId = serverInfo.value?.info?.currentInstance;
      return instances.value.find(
        (instance) => instance.instance === instanceId
      )?.friendly_name;
    });

    const running = computed(() => {
      if (!instances.value) {
        return 0;
      }

      return instances.value.filter(
        (instance) => instance.running === true
      ).length;
    });
    
    const stopped = computed(() => {
      if (!instances.value) {
        return 0;
      }

      return instances.value.length - running.value;
    });

    const status = computed(() => {
      return !error.value ? "online" : "offline";
    });

    const fetchStatus = async () => {
      const headers = {};

      const command = {
        command: "serverinfo",
      };

      const requestUrl = `${ENDPPOINT_SERVER_INFO}${encodeURIComponent(
        JSON.stringify(command)
      )}`;

      try {
        const response = await fetch(requestUrl, { headers });
        error.value = false;
        serverInfo.value = response;
      } catch (e) {
        error.value = true;
        console.error(e);
      }
    };

    fetchStatus();

    return {
      serverInfo,
      error,
      instances,
      currentInstance,
      running,
      stopped,
      status,
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

    &.running {
      background-color: #4fd671;
    }

    &.stopped {
      background-color: #e51111;
    }
  }
}
</style>
