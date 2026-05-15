<!-- 
  MIGRATED TO NEW ARCHITECTURE
  
  This service now uses the Adapter + Archetype pattern.
  No Vue logic needed here - just configuration!  
  The Service.vue component will:
  1. Load ../adapters/hyperhdr.js (data mapping logic)
  2. Load MetricCard archetype (visual presentation)
  3. Connect adapter data to archetype UI
-->

<template>
  <div />
</template>
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

